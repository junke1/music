<template>
  <div class="song-container" v-if="songInfo">
    <div class="w1200">
      <div class="song-sidebar">
        <div class="sidebar">
          <!-- 歌曲封面 -->
          <div class="cover">
            <div
              class="cover-img"
              :class="[isCurSong ? 'active' : '']"
              @click.stop="playing(songInfo)"
            >
              <img src="/src/assets/stylus.png" class="cover-stylus" />
              <img :src="songInfo.album.picUrl" alt="" class="img" />
            </div>
            <div class="cover-desc" v-if="coverDesc">
              <!-- 专辑简介 -->
              <h5>专辑简介</h5>
              <p>{{ coverDesc }}</p>
            </div>
            <div class="simi-song">
              <!-- 相似歌曲 -->
              <h6>相似歌曲</h6>
              <div class="simi-main">
                <div
                  class="simi-item"
                  v-for="simiItem in simiSong"
                  :key="simiItem.id"
                >
                  <!-- 歌曲名称 -->
                  <div class="simi-info">
                    <router-link
                      class="simi-name"
                      :to="{ path: '/song', query: { id: simiItem.id } }"
                    >
                      {{ simiItem.name }}
                    </router-link>
                    <!-- 歌手 -->
                    <div class="simi-author">
                      <router-link
                        :to="{ path: '/singer', query: { id: author.id } }"
                        class="song-author"
                        v-for="(author, k) in simiItem.singer"
                        :key="author.name"
                      >
                        {{ k !== 0 ? ' / ' + author.name : author.name }}
                      </router-link>
                    </div>
                  </div>
                  <div class="simi-song-status">
                    <i class="iconfont icon-vip" v-if="simiItem.vip"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="song-main">
        <!-- 歌名 -->
        <h3 class="song-name">
          {{ songInfo.name }}
          <!-- mv名 -->
          <router-link
            class="mv-name"
            :to="{ path: '/mv', query: { id: songInfo.mvId } }"
            v-if="songInfo.mvId"
          >
            <i class="iconfont icon-video"></i>
          </router-link>
          <i class="iconfont icon-vip" v-if="songInfo.vip"></i>
          <!-- 点击播放后出现的播放小图标 -->
          <div class="audio" v-if="isCurSong">
            <div class="column" style="animation-delay: -1.2s"></div>
            <div class="column"></div>
            <div class="column" style="animation-delay: -1.5s"></div>
            <div class="column" style="animation-delay: -0.9s"></div>
            <div class="column" style="animation-delay: -0.6s"></div>
          </div>
        </h3>
        <p>
          <!-- 歌手 -->
          <router-link
            :to="{ path: '/singer', query: { id: author.id } }"
            class="song-author"
            v-for="(author, k) in songInfo.singer"
            :key="author.name"
          >
            {{ k !== 0 ? ' / ' + author.name : author.name }}
          </router-link>
        </p>
        <p class="song-info">
          <!-- 专辑 -->
          <span>
            专辑:
            <router-link
              class="song-album"
              :to="{ path: '/album', query: { id: songInfo.album.id } }"
            >
              {{ songInfo.album.name }}
            </router-link>
          </span>
          <!-- 发行时间 -->
          <span
            >发行时间:
            <em>
              {{ songInfo.publishTime }}
            </em>
          </span>
        </p>
        <!-- 播放 -->
        <div class="song-oper">
          <span
            :class="['play-btn', 'play-all', songDisable]"
            @click="playing(songInfo)"
          >
            <i :class="['iconfont', playFontIcon]"></i>
            {{ songInfo.vip ? 'VIP尊享' : '立即播放' }}
          </span>
          <!-- 跳转评论区 -->
          <span class="play-btn play-comment" @click="jumpComment">
            <i class="iconfont icon-comment"></i>评论
          </span>
        </div>
        <!-- 回复评论 -->
        <div class="song-lyric">
          <Lyrics :sId="sId" local="page" />
        </div>
        <!-- 评论区显示 -->
        <div class="song-comments" ref="cBox">
          <CommentList :type="type" :sId="sId" />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getCurrentInstance,
  computed,
  onMounted,
  reactive,
  toRefs,
  ref,
  toRef,
} from 'vue';
import Lyrics from '@/components/Lyrics.vue';
import CommentList from '@/components/Comments.vue';
import { useStore } from 'vuex';
import { formatSongInfo } from '@utils/song';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';

export default {
  name: 'SongDetail',
  components: {
    Lyrics,
    CommentList,
  },
  setup() {
    const route = useRoute();
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const cBox = ref(null);
    const info = reactive({
      songInfo: null,
      sId: '0',
      type: 0, //0歌曲 1mv 2歌单 3专辑 4电台 5视频 6动态
      simiSong: [],
    });

    // 获取登录状态，是否播放，播放歌单，播放索引，当前歌曲信息
    const isLogin = computed(() => store.getters.isLogin);
    const isPlayed = computed(() => store.getters.isPlayed);
    const playList = computed(() => store.getters.playList);
    const playIndex = computed(() => store.getters.playIndex);
    const curSongInfo = computed(() => playList.value[playIndex.value]);

    const isCurSong = computed(
      () =>
        isPlayed.value && curSongInfo.value && curSongInfo.value.id === info.sId
    );

    //当前播放状态
    const playFontIcon = computed(() => {
      isCurSong.value ? 'icon-audio-pause' : 'icon-audio-play';
    });

    // 若是无版权获取vip歌曲 播放按钮置灰
    const songDisable = computed(() => {
      info.songInfo.license || info.songInfo.vip ? 'disable' : '';
    });

    // 显示歌曲简介
    const coverDesc = computed(() => info.songInfo.alia.join(' / '));

    // 获取歌曲详情
    const getSongDetail = async () => {
      const { data: res } = await proxy.$http.songDetail({
        ids: info.sId,
        timestamp: new Date().valueOf(),
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      // 是否有版权播放
      res.songs[0].license = !res.privileges[0].cp;
      info.songInfo = formatSongInfo(res.songs[0]);
    };

    // 获取相似音乐
    const getSimiSong = async () => {
      const { data: res } = await proxy.$http.simiSong({ id: info.sId });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.simiSong = res.songs.map((item) => {
        return {
          id: String(item.id),
          name: item.name,
          mvId: item.mvid,
          singer: item.artists,
          album: item.album,
          alia: item.alias,
          duration: proxy.$utils.formatSongTime(item.duration),
          url: `https://music.163.com/song/media/outer/url?id=${item.id}.mp3`,
          vip: item.fee === 1,
          license: item.license,
          publishTime: item.publishTime,
        };
      });
    };

    const playing = (params) => {
      // 若当前无歌曲 或者 当前播放歌曲不是本页现实的歌曲 立即播放当前页面歌曲
      if (!curSongInfo.value || curSongInfo.value.id !== params.id) {
        // 无版权及vip不可播放
        if (params.license) {
          proxy.$msg.error('由于版权保护，您所在的地区暂时无法使用');
          return;
        }

        if (params.vip) {
          proxy.$msg.error('付费歌曲，请在网易云音乐播放');
          return;
        }

        store.dispatch('selectPlay', { list: [params] });
        store.commit('SET_PLAYLISTTIPS', true);
      } else {
        store.commit('SET_PLAYSTATUS', !isPlayed.value);
      }
    };

    // 跳转到评论区
    const jumpComment = () => {
      cBox.value.scrollIntoView(true);
    };

    // 初始化
    const init = () => {
      if (info.sId !== '0') {
        getSongDetail();
        getSimiSong();
      }
    };

    // 更新该详情页面
    onBeforeRouteUpdate((to) => {
      info['sId'] = to.query.id;
      init();
    });

    onMounted(() => {
      info['sId'] = route.query.id;
      init();
    });

    return {
      ...toRefs(info),
      isCurSong,
      coverDesc,
      playing,
      songDisable,
      playFontIcon,
      isLogin,
      isPlayed,
      jumpComment,
      cBox,
      playList,
      playIndex,
      curSongInfo,
      getSongDetail,
      getSimiSong,
    };
  },
};
</script>
<style scoped lang="less">
.song-container {
  padding: 40px 0;

  .song-sidebar {
    position: fixed;
    width: 310px;
  }

  .song-main {
    position: relative;
    margin-left: 400px;
  }
}

.cover {
  position: relative;
}
.cover-img {
  position: relative;
  width: 190px;
  padding: 40px;
  font-size: 0;
  background: url('@/assets/disc.png') no-repeat;
  background-size: contain;
  cursor: pointer;

  .cover-stylus {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
    display: inline-block;
    width: 30px;
    height: 120px;
    transition: all 0.3s;
    transform-origin: 23px 5px;
    transform: rotateZ(-30deg);
  }

  .img {
    width: 190px;
    height: 190px;
    border-radius: 100%;
    animation: soundPaying 15s linear infinite;
    animation-play-state: paused;
  }

  &.active {
    .cover-stylus {
      transform: rotateZ(0);
    }

    img {
      animation-play-state: running;
    }
  }

  .iconfont {
    position: absolute;
    z-index: 3;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #fff;
  }
}

.cover-desc {
  h5 {
    margin-top: 40px;
    margin-bottom: 10px;
    font-size: 22px;
    font-weight: 600;
    height: 30px;
    line-height: 30px;
  }

  p {
    width: 100%;
    font-size: 14px;
    color: #999;
    line-height: 21px;
    word-break: break-all;
  }
}

.simi-song {
  h6 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 14px;
    height: 30px;
    line-height: 30px;
  }
  .simi-name {
    line-height: 20px;
    font-size: 12px;
    color: #000;
  }

  .simi-author {
    font-size: 0;

    a {
      font-size: 12px;
      color: #999;
    }
  }

  .simi-item {
    display: flex;
    padding-top: 5px;
    border-bottom: 1px solid #f2f2f2;
    margin-bottom: 5px;
  }

  .simi-info {
    flex: 1;
  }

  .simi-song-status {
    line-height: 48px;

    i {
      cursor: pointer;
    }
  }
}

.song-name {
  font-size: 30px;
  line-height: 60px;
  padding-bottom: 10px;

  .iconfont {
    margin-right: 10px;
    font-size: 24px;
    color: @color-theme;
  }

  .audio-icon {
    display: inline-flex;
  }
}
.song-author {
  display: inline-block;
  font-size: 18px;
  color: #666;
  line-height: 18px;
}

.song-info {
  padding: 20px 0;
  font-size: 0;
  color: #999;

  span {
    display: inline-block;
    padding-right: 30px;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
  }

  a,
  em {
    color: #333;
    font-style: normal;
  }
}

.song-oper {
  .play-btn {
    display: inline-block;
    line-height: 16px;
    align-items: center;
    border-radius: 50px;
    padding: 7px 15px;
    cursor: pointer;
    margin: 5px 15px 5px 0;
    background: #f0f0f0;
    color: #333;
  }

  .play-all {
    color: #fff;
    background: @color-theme;
    i {
      color: #fff;
    }
  }

  .disable {
    background: #ccc;
    cursor: not-allowed;
  }
}

@keyframes soundPaying {
  from {
    -webkit-transform: rotate(10deg);
    transform: rotate(10deg);
  }

  to {
    -webkit-transform: rotate(370deg);
    transform: rotate(370deg);
  }
}

.song-lyric {
  margin: 30px 0 10px;
  overflow-y: auto;
}

.song-comments {
  margin: 10px 0 30px;
}
</style>
