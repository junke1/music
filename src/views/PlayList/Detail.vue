<template>
  <div class="detail">
    <div class="w1200">
      <div class="detail-container">
        <!-- 歌单 -->
        <div class="detail-main">
          <div class="cover">
            <div class="cover-img">
              <img :src="details.coverImgUrl" alt="" />
            </div>
            <!-- 信息，名字，作者，日期，标签 -->
            <div class="cover-info">
              <div class="cover-title">
                {{ details.name }}
              </div>
              <div class="cover-author" v-if="details.creator">
                <img
                  :src="details.creator.avatarUrl"
                  class="cover-avatar"
                  alt=""
                />
                <div class="cover-name">
                  {{ details.creator.nickname }}
                </div>
                <div class="cover-date">
                  {{ $utils.formatDate(details.createTime, 'yyyy-MM-dd') }}
                </div>
              </div>
              <div class="cover-tags" v-if="details.tags">
                <router-link
                  :to="{ path: '/playlist', query: { cat: tag } }"
                  class="tag"
                  v-for="(tag, index) in details.tags"
                  :key="index"
                >
                  #{{ tag }}</router-link
                >
              </div>
              <!-- 播放次数，收藏量，评论数 -->
              <div class="cover-digital">
                <span class="cover-play-count">
                  <i class="iconfont icon-playnum"></i>
                  {{ $utils.formatNum(details.playCount) }} 次
                </span>
                <span class="cover-collect">
                  <i class="iconfont icon-collect"></i>
                  {{ $utils.formatNum(details.playCount) }}
                </span>
                <span class="cover-comment">
                  <i class="iconfont icon-comment"></i>
                  {{ $utils.formatNum(details.commentCount) }}
                </span>
              </div>
              <!-- 歌单介绍 -->
              <div class="cover-desc">
                <h5>
                  歌单介绍
                  <em
                    class="desc-close"
                    v-if="isShowDesc"
                    @click="isShowDesc = false"
                  >
                    <i class="iconfont icon-closed"></i>
                  </em>
                </h5>
                <!-- 点击pre小窗口获取详情 -->
                <p v-html="details.description" @click="showAllDesc"></p>
                <pre class="cover-desc-all" v-if="isShowDesc">
                  {{ details.description }}
                </pre>
              </div>
            </div>
          </div>
          <div class="song-main">
            <!-- 几首歌，全部播放，是否收藏 -->
            <div class="song-header">
              <h4>
                歌曲列表
                <em>
                  {{ total + '首歌' }}
                </em>
              </h4>
              <span class="play-all" @click="playAllSongs">
                <i class="iconfont icon-audio-play"></i>
                播放全部
              </span>
              <span
                :class="['icon-collect', details.subscribed] ? '-active' : ''"
                @click="subPlayList(details)"
              >
                <i
                  :class="[
                    'iconfont',
                    'icon-collect' + (details.subscribed ? '-active' : ''),
                  ]"
                ></i>
                {{ details.subscribed ? '已收藏' : '收藏' }}
              </span>
            </div>
            <template v-if="isLoading">
              <Loading />
            </template>
            <template v-else>
              <!-- 登录可获全部歌曲信息 -->
              <SongList :songList="songList" :stripe="true" />
              <div class="show-all-songs-tips" v-if="!isLogin">
                <span @click="loginDialog">登录后查看全部歌曲</span>
              </div>
            </template>
          </div>
        </div>
        <div class="detail-aside">
          <div class="playlist-collect">
            <h3 class="aside-title">喜欢这个歌单的人</h3>
            <div class="aside-main collect-main">
              <router-link
                class="collect-author"
                :to="{ path: '/user', query: { id: item.userId } }"
                v-for="item in collects"
                :key="item.userId"
              >
                <img :src="item.avatarUrl" alt="" />
              </router-link>
            </div>
          </div>
          <div class="playlist-recom">
            <!-- 跳转其他歌单详情页 -->
            <h3 class="aside-title">相关歌单推荐</h3>
            <div class="aside-main recom-main">
              <router-link
                :to="{ path: '/playlist/detail', query: { id: item.id } }"
                class="recom-item"
                v-for="item in playlists"
                :key="item.id"
              >
                <img :src="item.coverImgUrl" alt="" />
                <div class="recom-info">
                  <div class="recom-name">{{ item.name }}</div>
                  <div class="recom-author">
                    By.
                    <router-link
                      :to="{
                        path: '/user',
                        query: { id: item.creator.userId },
                      }"
                    >
                      {{ item.creator.nickname }}
                    </router-link>
                  </div>
                </div>
              </router-link>
            </div>
          </div>
          <!-- 歌单评论区 -->
          <div class="playlist-comment">
            <h3 class="aside-title">歌单评论</h3>
            <div class="aside-main comment-main">
              <div
                class="comment-item"
                v-for="item in comments"
                :key="item.commentId"
              >
                <!-- 头像 -->
                <router-link
                  :to="{ path: '/user', query: { id: item.user.userId } }"
                >
                  <img :src="item.user.avatarUrl" alt="" />
                </router-link>
                <div class="comment-info">
                  <div class="comment-user-info">
                    <!-- 姓名 -->
                    <router-link
                      :to="{ path: '/user', query: { id: item.user.userId } }"
                      class="comment-name"
                    >
                      {{ item.user.nickname }}
                    </router-link>
                    <!-- 发表时间 -->
                    <span class="comment-date">
                      {{ $utils.formatMsgTime(item.time) }}
                    </span>
                  </div>
                  <!-- 评论 -->
                  <div class="comment-desc">
                    {{ item.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getCurrentInstance,
  computed,
  watch,
  watchEffect,
  onMounted,
  reactive,
  toRefs,
  ref,
} from 'vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { formatSongInfo } from '@/utils/song';
import Loading from '@/components/Loading.vue';
import SongList from '@/components/SongList.vue';
import { useStore } from 'vuex';

export default {
  setup(props) {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const store = useStore();
    const info = reactive({
      id: '',
      details: {},
      songList: [],
      collects: [],
      playlists: [],
      comments: [],
      total: 0,
      isLoading: true,
      isShowDesc: false,
    });

    // 是否登录
    const isLogin = computed(() => store.getters.isLogin);

    // 登录及未登录下获取歌单中歌曲的列表
    const getDetail = async (params) => {
      info['isLoading'] = true;
      const { data: res } = await proxy.$http.playlistdetail(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info['details'] = res.playlist;

      if (isLogin.value) {
        const ids = res.playlist.trackIds;

        getAllSongs(ids);
      } else {
        info['songList'] = _formatSongs(res.playlist.tracks);
        info['total'] = info['songList'].length;
        info['isLoading'] = false;
      }
    };

    // 简介查看更多
    const showAllDesc = () => {
      if (info.details.description.length > 120) {
        info.isShowDesc = !info.isShowDesc;
      }
    };

    // 登录后根据ids获取所有歌曲列表
    const getAllSongs = async (ids) => {
      const sliceArr = [];
      const num = 500;
      let idsArr = [];

      // 数组过长 每500份一组
      for (let index = 0; index < ids.length; index += num) {
        sliceArr.push(ids.slice(index, index + num));
      }

      for (let i = 0; i < sliceArr.length; i++) {
        const arrs = [];
        sliceArr[i].map((d) => {
          arrs.push(d.id);
        });
        info['isLoading'] = true;
        const { data: res } = await proxy.$http.songDetail({
          ids: arrs.join(','),
          timestamp: new Date().valueOf() + i,
        });

        idsArr = idsArr.concat(_formatSongs(res.songs, res.privileges));
      }

      info['songList'] = idsArr;
      info['total'] = idsArr.length;
      info['isLoading'] = false;
    };

    // 订阅该歌单的用户列表
    const getCollect = async (params) => {
      const { data: res } = await proxy.$http.playlistScollect(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.collects = res.subscribers;
    };

    // 相关歌单推荐
    const getRecom = async (params) => {
      const { data: res } = await proxy.$http.playlistRelated(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.playlists = res.playlists;
    };

    // 歌单精彩评论
    const getComment = async (params) => {
      const { data: res } = await proxy.$http.playlistComment(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.comments = res.comments;
    };

    // 未登录状态，点击登录按钮，显示登陆框
    const loginDialog = () => {
      store.dispatch('loginSuc', true);
    };

    // 播放列表为当前歌单的全部歌曲
    const playAllSongs = () => {
      store.dispatch('playAll', {
        list: info.songList,
      });
      store.commit('SET_PLAYLISTTIPS', true);
    };

    // 收藏/取消歌单
    const subPlayList = async (item) => {
      const { data: res } = await proxy.$http.subPlayList({
        id: item.id,
        t: item.subscribed ? 2 : 1,
      });

      if (res.code !== 200) {
        return props.$msg.error('数据请求失败');
      }
      info.details.subscribed = !info.details.subscribed;
    };

    // 处理歌曲
    const _formatSongs = (list, privileges) => {
      const ret = [];
      list.map((item, index) => {
        if (item.id) {
          // 是否有版权播放
          if (privileges) {
            item.license = !privileges[index].cp;
          }

          ret.push(formatSongInfo(item));
        }
      });
      return ret;
    };

    const _initialize = (id) => {
      // 歌单详情
      getDetail({ id: id, s: 8 });
      // 歌单收藏者
      getCollect({ id: id, limit: 18 });
      // 相关歌单推荐
      getRecom({ id: id });
      // 歌单评论
      getComment({ id: id, limit: 9 });
    };

    watch(
      () => isLogin.value,
      (newVal, oldVal) => {
        if (newVal) {
          const ids = info.details.trackIds;

          getAllSongs(ids);
        } else {
          info.songList = _formatSongs(info.details.tracks);
          info.total = info.details.tracks.length;
        }
      }
    );

    onBeforeRouteUpdate((to) => {
      info.songList = [];
      info.total = 0;
      info.id = to.query.id;
      _initialize(info.id);
    });

    onMounted(() => {
      info.id = route.query.id;
      _initialize(info.id);
    });

    return {
      ...toRefs(info),
      isLogin,
      loginDialog,
      playAllSongs,
      subPlayList,
      showAllDesc,
    };
  },
  components: {
    Loading,
    SongList,
  },
};
</script>
<style scoped lang="less">
.detail-container {
  display: flex;
  flex-direction: row;
  flex: 1;
  flex-basis: auto;
  box-sizing: border-box;
  padding: 40px 0 0 0;
}
.detail-main {
  flex: 1;
  padding-bottom: 100px;
  overflow: hidden;
}
.detail-aside {
  width: 300px;
  padding-left: 20px;

  .aside-title {
    position: relative;
    font-size: 16px;
    line-height: 24px;

    &::before {
      content: '';
      display: inline-block;
      width: 4px;
      height: 18px;
      margin: 3px 5px 0 0;
      border-radius: 2px;
      background: @color-theme;
      vertical-align: top;
    }
  }
}
.cover {
  display: flex;
}
.cover-img {
  position: relative;
  width: 280px;
  height: 280px;
  img {
    width: 100%;
    height: 100%;
  }

  &::after {
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    width: 100%;
    height: 100%;
    content: '';
    transform: scale(0.95) translateX(5%);
    background: #f0f0f0;
  }
}
.cover-info {
  flex: 1;
  padding-left: 40px;

  .cover-title {
    font-size: 24px;
    font-weight: bold;
  }
}
.cover-author {
  padding: 15px 0 10px;

  .cover-avatar {
    display: inline-block;
    width: 32px;
    height: 32px;
    border-radius: 100%;
    vertical-align: top;
  }

  .cover-name,
  .cover-date {
    display: inline-block;
    padding: 0 10px;
    line-height: 32px;
  }

  .cover-date {
    color: #999;
  }
}
.cover-tags {
  padding-bottom: 5px;
  line-height: 16px;

  .tag {
    display: inline-block;
    margin-right: 5px;
    font-size: 12px;
    color: @color-theme;
  }
}
.cover-play-count,
.cover-collect,
.cover-comment {
  display: inline-block;
  padding: 0 20px 5px 0;
  line-height: 16px;
  font-size: 14px;
  color: #999;

  i {
    vertical-align: top;
  }
}
.cover-desc {
  position: relative;

  h5 {
    padding: 30px 0 5px;
    line-height: 20px;
    font-size: 14px;
    color: #333;
  }

  .desc-close {
    position: absolute;
    top: 30px;
    right: 0;
    cursor: pointer;
  }

  p {
    line-height: 22px;
    font-size: 14px;
    color: #999;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    word-break: break-all;
    cursor: pointer;
  }

  .cover-desc-all {
    position: absolute;
    top: 68px;
    left: 10px;
    z-index: 1;
    width: calc(~'100% - 20px');
    padding: 20px;
    margin: -10px;
    max-height: 250px;
    line-height: 22px;
    font-size: 14px;
    white-space: pre-line;
    font-family: inherit;
    color: #999;
    background: #fff;
    overflow-y: scroll;
    box-shadow: 0 2px 10px 0 rgba(52, 52, 52, 0.1);
  }
}

.song-header {
  display: flex;
  padding: 30px 0 10px;

  h4 {
    flex: 1;
    font-size: 20px;
    line-height: 40px;

    em {
      display: inline-block;
      padding-left: 10px;
      font-size: 12px;
      line-height: 14px;
      font-style: normal;
      font-weight: normal;
      color: #666;
      vertical-align: baseline;
    }
  }

  span {
    display: flex;
    line-height: 16px;
    align-items: center;
    justify-content: center;
    border-radius: 50px;
    padding: 7px 20px;
    cursor: pointer;
    margin: 5px 0 5px 15px;
    transition: all 0.4s;
    background: #f0f0f0;
    color: #333;

    i {
      margin-right: 3px;
    }
  }

  .play-all {
    color: #fff;
    background: @color-theme;

    i {
      color: #fff;
    }
  }

  .icon-collect-active,
  .icon-collect-active i {
    color: @color-theme;
  }
}

.show-all-songs-tips {
  text-align: center;
  padding: 40px 0;

  span {
    display: inline-block;
    display: flex;
    line-height: 16px;
    align-items: center;
    justify-content: center;
    border-radius: 50px;
    padding: 7px 20px;
    color: #fff;
    background: @color-theme;
    cursor: pointer;
  }
}

.aside-main {
  font-size: 0;
  padding-bottom: 30px;

  .collect-author {
    display: inline-block;
    width: 40px;
    height: 40px;
    margin: 10px 5px;
    border-radius: 100%;
    overflow: hidden;
    img {
      width: 100%;
    }
  }
}

.collect-main {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin: 0 -10px;
}
.recom-main {
  img {
    width: 60px;
    height: 60px;
    border-radius: 4px;
    overflow: hidden;
  }

  .recom-item {
    display: flex;
    padding: 10px 0;
  }

  .recom-info {
    flex: 1;
    padding-left: 10px;
  }

  .recom-name {
    width: 100%;
    height: 20px;
    line-height: 20px;
    font-size: 14px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    word-break: break-all;
    cursor: pointer;
  }

  .recom-author {
    height: 20px;
    line-height: 20px;
    margin-top: 20px;
    font-size: 12px;
    color: #999;

    a {
      color: #666;
    }
  }
}

.comment-main {
  font-size: 0;

  img {
    width: 40px;
    height: 40px;
    border-radius: 100%;
    overflow: hidden;
  }

  .comment-item {
    display: flex;
    padding: 10px 0;
  }

  .comment-info {
    flex: 1;
    padding-left: 10px;
  }

  .comment-userInfo {
    width: 100%;
    font-size: 0;
  }

  .comment-name {
    font-size: 14px;
    line-height: 14px;
    font-weight: bold;
  }

  .comment-desc {
    font-size: 12px;
    color: #666;
    line-height: 1.6;
    padding: 5px 10px;
    background: #f5f5f5;
    margin: 5px 0;
    border-radius: 3px;
  }

  .comment-date {
    display: inline-block;
    padding-left: 5px;
    font-size: 12px;
    color: #666;
  }
}

.el-table :deep(thead th) {
  font-weight: normal;
  background-color: #f5f7fa;
}
</style>
