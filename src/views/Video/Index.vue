l
<template>
  <div class="video-detail" v-if="videoOptions.src">
    <div class="w1200">
      <div class="video-main">
        <!-- 视频播放 -->
        <videoPlay
          width="100%"
          height="100%"
          :poster="videoOptions.poster"
          :src="videoOptions.src"
        />
      </div>
      <div class="video-info">
        <div class="video-info-hd">
          <div class="info-name">
            <!-- 名称 -->
            {{ videoDetail.title }}
          </div>
          <!-- 昵称 -->
          <router-link
            :to="{ path: '/user', query: { id: videoDetail.creator.userId } }"
            v-if="videoDetail.creator"
            class="song-author"
          >
            By.{{ videoDetail.creator.nickname }}
          </router-link>
          <!-- 播放量，发布时间 -->
          <div class="video-info-count">
            <span class="info-count">
              播放量:{{ $utils.formatNum(videoDetail.playCount) }}
            </span>
            <span class="info-time">
              发布时间:{{
                $utils.formatDate(videoDetail.publishTime, 'yyyy-MM-dd')
              }}
            </span>
          </div>
        </div>
        <!-- 简介 -->
        <div class="video-desc">
          {{ videoDetail.briefDesc ? videoDetail.briefDesc : '暂无简介' }}
        </div>
      </div>
    </div>
    <div class="w1200">
      <div class="video-container">
        <!-- 评论区 -->
        <div class="video-main">
          <CommentList :type="types" :sId="vId" />
        </div>
        <div class="video-aside">
          <!-- 相关视频 -->
          <div class="simi-mv">
            <h3 class="aside-title">相关视频</h3>
            <div class="aside-main video-main">
              <div
                class="item"
                v-for="(item, index) in simiVideo"
                :key="'' + item.id + index"
              >
                <!-- 进入其他视频页 -->
                <router-link
                  :to="{
                    path: item.type ? '/video' : '/mv',
                    query: { id: item.vid },
                  }"
                  class="face-img"
                >
                  <i class="iconfont icon-play"></i>
                  <img :src="item.coverUrl" alt="" />
                  <span class="play-count">
                    <i class="iconfont icon-video"></i>
                    <em>
                      {{ $utils.formatNum(item.playTime) }}
                    </em>
                  </span>
                  <div class="v-time">
                    {{ $utils.formatSongTime(item.durationms) }}
                  </div>
                </router-link>
                <div class="info">
                  <!-- 跳转指定视频 -->
                  <router-link
                    :to="{
                      path: '/video',
                      query: { id: item.vid },
                    }"
                    class="v-name"
                  >
                    {{ item.title }}
                  </router-link>
                  <!-- 跳转用户界面 -->
                  <router-link
                    :to="{
                      path: '/user',
                      query: { uid: author.userId },
                    }"
                    class="v-author"
                    v-for="(author, k) in item.creator"
                    :key="k"
                    >By.
                    {{ k !== 0 ? ' / ' + author.userName : author.userName }}
                  </router-link>
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
import { getCurrentInstance, onMounted, reactive, toRefs, ref } from 'vue';
import CommentList from '@/components/Comments.vue';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import 'vue3-video-play/dist/style.css';
import { videoPlay } from 'vue3-video-play';
export default {
  name: 'videoDetail',
  components: {
    CommentList,
    videoPlay,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const store = useStore();
    const info = reactive({
      vId: '0',
      videoDetail: {},
      types: 5, //0歌曲 1mv 2歌单 3专辑 4电台 5视频 6动态
      videoOptions: {
        src: '', //视频源
        poster: '',
      },
      simiVideo: [],
    });

    // 视频详情
    const getVideoDetail = async () => {
      const { data: res } = await proxy.$http.videoDetail({ id: info.vId });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.videoDetail = res.data;
      info.videoOptions.poster = res.data.coverUrl;
    };

    // 播放路径
    const getMvUrl = async (r) => {
      const { data: res } = await proxy.$http.videoUrl({ id: info.vId, r });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.videoOptions.src = res.urls[0].url;
    };

    // 相关视频
    const getSimiVideo = async () => {
      const { data: res } = await proxy.$http.simiVideo({ id: info.vId });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.simiVideo = res.data;
    };

    // 初始化
    const init = () => {
      getVideoDetail();
      getMvUrl();
      getSimiVideo();
    };

    onBeforeRouteUpdate((to) => {
      info['vId'] = to.query.id;
      init();
    });

    onMounted(() => {
      info['vId'] = route.query.id;
      init();
      store.commit('SET_PLAYSTATUS', false);
    });
    return {
      ...toRefs(info),
    };
  },
};
</script>
<style scoped lang="less">
.mv-video {
  width: 100%;
  padding: 40px 0 20px;

  .video-box {
    width: 100%;
  }
}
.video-main {
  position: relative;

  .video-light {
    position: absolute;
    top: 50%;
    right: 0;
    width: 50px;
    height: 50px;
    line-height: 50px;
    margin-top: -25px;
    text-align: center;
    border-radius: 10px 0 0 10px;
    background: #fff;
    cursor: pointer;

    .iconfont {
      color: #000;
      font-size: 30px;
    }

    &.active {
      background: #333;

      .iconfont {
        color: #fff;
      }
    }
  }
}
.video-info-hd {
  display: flex;
  padding: 20px 0;

  .info-name {
    padding-right: 20px;
    font-size: 24px;
    line-height: 24px;
  }
  .song-author {
    line-height: 24px;
    color: #666;
  }
  .video-info-count {
    flex: 1;
    text-align: right;

    span {
      display: inline-block;
      padding-left: 20px;
      line-height: 24px;
      color: #999;
    }
  }
}
.video-desc {
  line-height: 20px;
  color: #999;
}
.video-container {
  display: flex;
  flex-direction: row;
  flex: 1;
  flex-basis: auto;
  box-sizing: border-box;
  margin-top: -20px;

  .video-main {
    flex: 1;
  }

  .video-aside {
    width: 300px;
    padding: 40px 0 0 20px;
  }
}
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

.item {
  flex: 30%;
  margin: 20px 10px 0;
  border-radius: 4px;

  img {
    width: 100%;
    height: 100%;
  }
  &:hover {
    img {
      transform: scale(1.1);
    }

    .icon-play {
      opacity: 1;
      transform: scale(1);
    }
  }

  .face-img {
    display: block;
    position: relative;
    width: 100%;
    height: 123px;
    overflow: hidden;
  }

  .icon-play {
    position: absolute;
    top: 50%;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 3;
    margin-top: -30px;
    font-size: 60px;
    text-align: center;
    color: #fff;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.4s linear;
    text-shadow: 2px 2px 10px #000;
  }

  img {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    z-index: 2;
    transition: all 0.4s linear;
    height: auto;
  }

  .info {
    position: relative;
    padding: 15px 0 0;

    .video-name {
      display: block;
      font-size: 14px;
    }

    .video-author,
    .video-playCount,
    .video-time {
      display: block;
      line-height: 24px;
      font-size: 14px;
      color: #999;
    }

    .icon-video {
      font-size: 24px;
      color: #999;
      vertical-align: top;
    }
  }
}
</style>
