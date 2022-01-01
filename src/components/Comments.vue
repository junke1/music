<template>
  <!-- 评论区组件，包括自己评论，以及显示已有的一点评论，接口仅返回热门的十条以及最新的二十条 -->
  <div class="comments">
    <div class="comment-hd">
      <h2>
        评论<em>共{{ total }}条评论</em>
      </h2>
      <!-- 用户名 -->
      <div class="user-info" v-if="userInfo">
        <span>{{ userInfo.nickname }}</span>
      </div>
    </div>
    <!-- 用户评论区 -->
    <el-form class="comment-box">
      <div class="comment-textarea">
        <div class="pre">{{ msg }}</div>
        <textarea
          class="j-inp-box inp-paragraph"
          name="id"
          placeholder="期待你的神评论......"
          v-model="msg"
        ></textarea>
      </div>
      <div class="comment-box-footer">
        <div class="button" @click="subComment">评论</div>
        <span class="comment-limit">
          <em class="num">
            {{ msg.length }}
          </em>
          /{{ maxLen }}
        </span>
      </div>
    </el-form>
    <div class="comment-area">
      <!-- 如果有评论则显示，没有且不为空，则显示加载中，两者都无则显示暂无留言 -->
      <template v-if="comments.length">
        <div
          class="comment-item"
          v-for="(item, index) in comments"
          :key="item.commentId + index + ''"
        >
          <!-- 其他用户头像，昵称，点击可跳转到对应的用户页面，尚未制作 -->
          <router-link
            :to="{ path: '/user', query: { id: item.user.userId } }"
            class="comment-avatar"
          >
            <img :src="item.user.avatarUrl + '?param=120y120'" alt="" />
          </router-link>
          <div class="comment-info">
            <router-link
              :to="{ path: '/user', query: { id: item.user.userId } }"
            >
              {{ item.user.nickname }}
            </router-link>
            <!-- 评论 -->
            <div class="comment-content">
              {{ item.content }}
            </div>
            <!-- 回复的用户评论信息 -->
            <div
              class="comment-reply"
              v-for="replyItem in item.beReplied"
              :key="replyItem.beRepliedCommentId"
            >
              <router-link
                :to="{ path: '/user', query: { id: replyItem.user.userId } }"
              >
                {{ replyItem.user.nickname }}
              </router-link>
              {{ replyItem.content }}
            </div>
            <div class="comment-footer">
              <!-- 日期 -->
              <div class="comment-time">
                {{ $utils.formatMsgTime(item.time) }}
              </div>
              <div class="comment-oper">
                <!-- 如果是自己的评论则显示删除按钮 -->
                <em
                  class="comment-del"
                  v-if="userInfo && userInfo.userId === item.user.userId"
                  @click="delComment(item)"
                >
                  <i class="iconfont icon-del"></i>
                </em>
                <!-- 点赞 -->
                <span
                  :class="[item.liked ? 'active' : '']"
                  @click="likeComment(item)"
                >
                  <i class="iconfont icon-praise"></i>
                  {{ item.likedCount }}
                </span>
                <!-- 回复 -->
                <span class="reply-comment" @click="replyComment(item, index)">
                  <i class="iconfont icon-comment"></i>
                </span>
              </div>
            </div>
            <!-- 推荐显示 -->
            <div class="is-hot" v-if="item.isHot">
              <i class="iconfont icon-choicest"></i>
            </div>
            <!-- 点击评论时出现回复窗口 -->
            <transition name="fade" mode="out-in">
              <ReplyComment
                :params="item"
                v-if="isShowReply(item, index)"
                @replyMsg="replyMsg"
              />
            </transition>
          </div>
        </div>
        <!-- 接口返回的total值与评论总数不同，只返回二十组，所以此处分页组件仅装饰用 -->
        <div class="pagination">
          <el-pagination
            @current-change="currentChange"
            layout="prev, pager, next"
            :current-page="currentPage"
            :page-size="pageSize"
            :total="total"
            class="pag"
          >
          </el-pagination>
        </div>
      </template>
      <div class="comments-status" v-else>
        <div class="loading" v-if="!isEmpty">评论加载中...</div>
        <div class="empty" v-else>
          <p><i class="iconfont icon-empty-main"></i></p>
          <p>暂无留言</p>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { useStore } from 'vuex';
import {
  getCurrentInstance,
  computed,
  watch,
  onMounted,
  reactive,
  toRefs,
} from 'vue';
import ReplyComment from './Reply.vue';
export default {
  name: 'Comments',
  components: {
    ReplyComment,
  },
  props: {
    sId: {
      type: [Number, String],
      default: 0,
    },
    type: {
      type: Number,
      default: 0,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const info = reactive({
      msg: '',
      maxLen: 140,
      curId: props.sId,
      limit: 20,
      offset: 0,
      before: 0,
      hotComments: [],
      comments: [],
      pageSize: 20,
      currentPage: 1,
      total: 0,
      currentPage: 0,
      isEmpty: false,
      replyCommentId: 0,
      replyIndex: -1,
    });

    // 用户信息，登录状态
    const userInfo = computed(() => store.getters.userInfo);
    const isLogin = computed(() => store.getters.isLogin);

    // 展示回复窗口
    const isShowReply = computed(() => {
      return function (item, index) {
        return (
          item.commentId === info.replyCommentId && info.replyIndex === index
        );
      };
    });

    //  获取页面评论
    const getComment = () => {
      // 0歌曲 1mv 2歌单 3专辑 4电台 5视频 6动态
      switch (props.type) {
        case 0:
          getCommentList('commentSong');
          break;
        case 1:
          getCommentList('commentMv');
          break;
        case 3:
          getCommentList('albumComment');
          break;
        case 5:
          getCommentList('commentVideo');
          break;
      }
    };

    // 获取评论
    const getCommentList = async (type) => {
      const { data: res } = await proxy.$http[type]({
        id: info.curId,
        limit: info.limit,
        offset: info.offset,
        before: info.before,
        timestamp: new Date().valueOf(),
      });

      msgHandler(res);
    };

    const msgHandler = (res) => {
      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.total = res.total;
      info.hotComments = res.hotComments || [];
      info.hotComments.map((item) => {
        item.isHot = true;
        return item;
      });
      info.comments = [...info.hotComments, ...res.comments];
      // 当前评论是否为空
      info.isEmpty = info.before === 0 && !info.comments.length;
    };

    // 发布/删除/回复评论
    const commentHandler = async (t, content, commentId) => {
      const { data: res } = await proxy.$http.comment({
        t: t,
        type: props.type,
        id: info.curId,
        content: content,
        commentId: commentId,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.msg = '';

      if (t === 0) {
        proxy.$msg.success('删除评论成功!');
      } else if (t === 1) {
        proxy.$msg.success('评论成功!');
      } else if (t === 2) {
        proxy.$msg.success('回复评论成功!');
        info.replyCommentId = 0;
        info.replyIndex = -1;
      }
      getComment();
    };

    // 发布评论
    const subComment = async () => {
      if (!isLogin.value) {
        store.commit('setLoginDialog', true);
        return;
      }
      commentHandler(1, info.msg);
    };

    // 删除评论
    const delComment = (item) => {
      proxy.$msgBox
        .confirm('确定删除评论？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          center: true,
        })
        .then(() => {
          commentHandler(0, '', item.commentId);
        })
        .catch(() => {});
    };

    // 回复评论
    const replyComment = (item, index) => {
      if (!isLogin.value) {
        store.commit('setLoginDialog', true);
        return;
      }
      info.replyCommentId =
        info.replyCommentId === item.commentId && info.replyIndex === index
          ? 0
          : item.commentId;
      info.replyIndex = index;
    };
    // 此处为用户回复后提交的状态
    const replyMsg = (msg) => {
      if (!isLogin.value) {
        store.commit('setLoginDialog', true);
        return;
      }
      commentHandler(2, msg, info.replyCommentId);
    };

    // 给评论点赞
    const likeComment = async (item) => {
      if (!isLogin.value) {
        store.commit('setLoginDialog', true);
        return;
      }

      const { data: res } = await proxy.$http.commentLike({
        id: info.curId,
        cid: item.commentId,
        t: Number(!item.liked),
        type: props.type,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      // 点赞完刷新一下页面评论
      getComment();
    };

    // 留言分页
    const currentChange = (page) => {
      info.offset = (page - 1) * info.limit;
    };

    // 挂载时加载页面评论
    onMounted(() => {
      getComment();
    });

    // 检测传入的类型值id的变化，sid可能时专辑的id，可能是mv，或者其他类型的id
    watch(
      () => props.sId,
      (newVal, oldVal) => {
        info['curId'] = newVal;
        info['offset'] = 0;
        getComment();
      }
    );

    // 监视控制用户输入的字数
    watch(
      () => info.msg,
      () => {
        info.msg =
          info.maxLen >= info.msg
            ? info.msg
            : info.msg.substring(0, info.maxLen);
      }
    );

    return {
      ...toRefs(info),
      userInfo,
      isLogin,
      subComment,
      delComment,
      replyMsg,
      replyComment,
      likeComment,
      isShowReply,
      currentChange,
    };
  },
};
</script>
<style scoped lang="less">
.comments {
  padding-top: 30px;
}

.comment-hd {
  display: flex;
  align-items: center;
  height: 60px;
  font-size: 0;

  h2 {
    flex: 1;
    font-size: 24px;
    line-height: 24px;
    font-weight: normal;

    em {
      padding-left: 20px;
      font-size: 14px;
      line-height: 14px;
      font-style: normal;
      color: #999;
    }
  }

  .user-info {
    .avatar {
      width: 30px;
      height: 30px;
      border-radius: 4px;
      vertical-align: top;
    }

    span {
      display: inline-block;
      padding: 0 20px;
      line-height: 30px;
      font-size: 14px;
      color: #666;
    }
  }
}

.comment-box {
  .comment-textarea {
    position: relative;
    border: 1px solid #e9e9e9;
    border-radius: 4px;
    background: #fff;
  }

  .pre {
    visibility: hidden;
  }

  .inp-paragraph {
    position: absolute;
    top: 0;
    left: 0;
    height: calc(100% - 20px);
    resize: none;
    width: auto;
    padding: 0;
    border: 0;
    margin: 0;
    font-family: inherit;
    border-radius: 0;
    box-shadow: none;
    overflow: hidden;
  }

  .inp-paragraph,
  .pre {
    width: calc(100% - 30px);
    padding: 10px 15px;
    line-height: 24px;
    min-height: 90px;
    font-size: 14px;
    color: #333;
    border-radius: 4px;
    white-space: pre-wrap;
    word-wrap: break-word;
  }

  .comment-box-footer {
    display: flex;
    padding: 15px 0 50px;
    justify-content: space-between;
    .button {
      border: none;
      color: #666;
      background: rgba(236, 236, 236, 0.795);
      border-radius: 16px;
      width: 60px;
      text-align: center;
      line-height: 28px;
      cursor: pointer;
      &:hover {
        color: rgb(255, 255, 255);
        background: @color-theme;
      }
    }
  }

  .comment-limit {
    display: inline-block;
    line-height: 28px;
    padding: 0 0 0 20px;
    font-size: 14px;
    color: #666;

    em {
      font-style: normal;
    }
  }
}

.comments-status {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;

  .loading {
    font-size: 14px;
    line-height: 24px;
    color: #999;
  }

  .empty {
    text-align: center;

    p {
      font-size: 14px;
      line-height: 24px;
      color: #999;
    }

    .icon-empty-main {
      line-height: 140px;
      font-size: 100px;
      color: #bbb;
      opacity: 0.8;
    }
  }
}

.comment-item {
  position: relative;
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #f2f2f2;

  .comment-avatar {
    display: in;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    overflow: hidden;
    img {
      width: 100%;
    }
  }

  .comment-info {
    flex: 1;
    padding-left: 20px;

    a {
      display: inline-block;
      padding-bottom: 10px;
      line-height: 14px;
      color: #999;

      &:hover {
        color: @color-theme;
      }
    }
  }

  .comment-content {
    line-height: 24px;
  }

  .comment-reply {
    padding: 10px;
    line-height: 28px;
    margin: 5px 0;
    border-radius: 4px;
    color: #666;
    background: #f2f2f2;

    a {
      display: inline-block;
      line-height: 28px;
      padding: 0;
    }
  }

  .comment-footer {
    display: flex;
    color: #999;

    .comment-time {
      display: inline-block;
      line-height: 28px;
    }

    .comment-oper {
      flex: 1;
      text-align: right;

      span {
        display: inline-block;
        margin-left: 15px;
        line-height: 28px;
        cursor: pointer;

        &.active,
        &.active .iconfont {
          color: @color-theme;
        }
      }
    }
  }

  .is-hot {
    position: absolute;
    right: 0;
    top: -8px;
    z-index: 1;
    // transform: rotate(45deg);

    .icon-choicest {
      font-size: 60px;
      color: @color-theme;
      opacity: 0.8;
    }
  }

  .comment-del {
    cursor: pointer;
    display: none;
  }

  &:hover {
    .comment-del {
      display: inline-block;
    }
  }

  &:last-child {
    border: none;
  }
}

.pagination {
  padding: 30px 0;
  text-align: center;
  display: flex;
  justify-content: center;
  :deep(.pag) {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    ul li {
      list-style: none;
      display: inline-block;
      margin: 0 20px;
    }
    li.active,
    li:hover {
      color: #49a1ff;
      text-align: none;
      background: white;
      border: #ddd;
      cursor: pointer;
    }
    button {
      padding: 0;
      margin: 0;
      list-style: none;
      border: none;
      background: white;
      display: inline-block;
    }
    button.disabled {
      color: #868e96;
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
