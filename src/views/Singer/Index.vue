<template>
  <div class="singer" v-if="artist">
    <div class="w1200">
      <!-- 歌手页 -->
      <div class="singer-info">
        <!-- 头像，姓名 -->
        <div class="singer-avatar">
          <img :src="artist.img1v1Url" alt="" />
        </div>
        <div class="singer-desc">
          <div class="singer-author">
            <div class="singer-name">
              {{ artist.name }}
            </div>
            <router-link
              v-if="artist.accountId"
              class="singer-btn singer-home"
              :to="{ path: '/user', query: { id: artist.accountId } }"
            >
              <i class="iconfont icon-home"></i>
              个人主页
            </router-link>
            <!-- 收藏 -->
            <span
              :class="[
                'singer-btn',
                'singer-collect',
                artist.followed ? 'active' : '',
              ]"
              @click="getArtistSub(artist.followed ? 0 : 1)"
            >
              <i
                :class="[
                  'iconfont',
                  'icon-collect' + (artist.followed ? '-active' : ''),
                ]"
              ></i>
              {{ artist.followed ? '已收藏' : '收藏' }}
            </span>
          </div>
          <!-- 简介介绍 -->
          <div class="singer-brief">
            {{ artist.briefDesc ? artist.briefDesc : '暂无简介' }}
            <span v-if="introduction.length" @click="moreDesc">更多>></span>
          </div>
        </div>
      </div>
    </div>
    <!-- 作品 -->
    <div class="singer-main">
      <div class="w1200">
        <div class="singer-hd">
          <em>作品集</em>
          <div class="singer-tab">
            <span
              :class="[type === 'hot' ? 'active' : '']"
              @click="changeType('hot')"
            >
              热门作品
            </span>
            <span
              :class="[type === 'album' ? 'active' : '']"
              @click="changeType('album')"
            >
              所有专辑
            </span>
            <span
              :class="[type === 'mv' ? 'active' : '']"
              @click="changeType('mv')"
            >
              相关MV
            </span>
          </div>
          <!-- 播放，添加操作 -->
          <div class="singer-oper" v-if="type === 'hot'">
            <span @click="playAllSongs" class="singer-btn play-all">
              <i class="iconfont icon-audio-play"></i>
              播放全部
            </span>
            <span @click="addAll" class="singer-btn add-all">
              <i class="iconfont icon-add"></i>
              添加到播放列表
            </span>
          </div>
        </div>
        <div class="singer-list">
          <!-- 热门歌曲 -->
          <div v-show="type === 'hot'">
            <SongList :songList="hotSongs" :stripe="true" />
          </div>
          <!-- 专辑 -->
          <div v-show="type === 'album'">
            <AlbumList
              :albumList="hotAlbums"
              :loading="album_loading"
              :num="album_count"
            />
          </div>
          <!-- mv -->
          <div
            class="wrapper infinite-list"
            v-show="type === 'mv'"
            v-infinite-scroll="loadMv"
            infinite-scroll-disabled="isLoadMv"
            infinite-scroll-distance="50"
          >
            <MvList :mvList="hotMvs" :loading="mv_loading" :num="mv_count" />
            <template v-if="isLoading">
              <Loading />
            </template>
          </div>
        </div>
        <div class="pagination" v-if="type === 'album'">
          <el-pagination
            @current-change="currentChange"
            layout="prev, pager, next"
            :page-size="limit"
            :total="total"
            class="pag"
          ></el-pagination>
        </div>
      </div>
    </div>
    <!-- 艺人详情介绍 -->
    <el-dialog
      :title="artist.name"
      v-model="dialogDescVisible"
      :destroy-on-close="true"
    >
      <div class="artist-desc-main">
        <dl class="introduction">
          <dt>艺人介绍</dt>
          <dd>{{ artist.briefDesc }}</dd>
        </dl>
        <dl
          class="introduction"
          v-for="(item, index) in introduction"
          :key="index"
        >
          <dt>{{ item.ti }}</dt>
          <dd>{{ item.txt }}</dd>
        </dl>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { getCurrentInstance, onMounted, reactive, toRefs, ref } from 'vue';
import SongList from '@/components/SongList.vue';
import AlbumList from '@/components/AlbumList.vue';
import MvList from '@/components/MvList.vue';
import Loading from '@/components/Loading.vue';
import { useRoute, useRouter } from 'vue-router';
import store from '../../store';
export default {
  name: 'Singer',
  components: {
    SongList,
    AlbumList,
    MvList,
    Loading,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();
    const route = useRoute();
    const info = reactive({
      sUid: '',
      artist: null,
      hotSongs: [],
      hotAlbums: [],
      hotMvs: [],
      introduction: [],
      type: 'hot',
      limit: 12,
      offset: 0,
      total: 0,
      timer: null,
      dialogDescVisible: false,
      isLoading: true,
      isLoadMv: true,
      album_loading: true,
      album_count: 12,
      mv_count: 20,
      mv_loading: true,
    });

    // 歌手介绍
    const getArtistDesc = async () => {
      const { data: res } = await proxy.$http.artistDesc({
        id: info.sUid,
        timestamp: new Date().valueOf(),
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.introduction = res.introduction;
    };

    // 获取歌手信息
    const getArtists = async () => {
      const { data: res } = await proxy.$http.artists({
        id: info.sUid,
        timestamp: new Date().valueOf(),
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.artist = res.artist;
      info.hotSongs = res.hotSongs.map((item) => {
        return {
          id: String(item.id),
          name: item.name,
          mvId: item.mv,
          singer: item.ar,
          album: item.al,
          alia: item.alia,
          vip: item.fee === 1,
          license: item.license,
          duration: proxy.$utils.formatSongTime(item.dt),
          url: `https://music.163.com/song/media/outer/url?id=${item.id}.mp3`,
          publishTime: proxy.$utils.formatMsgTime(item.publishTime),
        };
      });
    };

    // 收藏
    const getArtistSub = async (t) => {
      const { data: res } = await proxy.$http.artistSub({ id: info.sUid, t });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      proxy.$msg.success('操作成功');
      getArtists();
    };

    // 专辑
    const getArtistAlbum = async () => {
      info.album_loading = true;
      const { data: res } = await proxy.$http.artistAlbum({
        id: info.sUid,
        limit: info.limit,
        offset: info.offset,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.total = res.artist.albumSize;
      info.hotAlbums = res.hotAlbums;
      info.album_loading = false;
    };

    //mv
    const getArtistMv = async () => {
      const { data: res } = await proxy.$http.artistMv({
        id: info.sUid,
        limit: 20,
        offset: info.offset,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.hotMvs = [...info.hotMvs, ...res.mvs];
      info.isLoading = res.hasMore;
      info.isLoadMv = !res.hasMore;
      info.offset += 20;
      info.mv_loading = false;
    };

    // 加载mv
    const loadMv = () => {
      getArtistMv();
    };

    // 更多简介
    const moreDesc = () => {
      info.dialogDescVisible = true;
    };

    // 切换作品集类型
    const changeType = (type) => {
      const params = {
        id: info.sUid,
      };
      info.type = type;
      info.offset = 0;
      switch (info.type) {
        case 'hot':
          getArtists();
          break;
        case 'album':
          getArtistAlbum();
          break;
        case 'mv':
          info.hotMvs = [];
          info.mv_loading = true;
          getArtistMv();
          break;
      }
      if (type !== 'hot') {
        params.type = info.type;
      }
      router.push({ path: 'singer', query: params });
    };

    //  专辑分页
    const currentChange = (page) => {
      info.offset = (page - 1) * info.limit;
      getArtistAlbum();
    };

    // 初始化
    const init = () => {
      info.sUid = route.query.id;
      getArtistDesc();
      switch (info.type) {
        case 'hot':
          getArtists();
          break;
        case 'album':
          getArtistAlbum();
          break;
        case 'mv':
          getArtistMv();
          break;
      }
    };

    // 全部播放
    const playAllSongs = () => {
      store.dispatch('playAll', {
        list: info.hotSongs,
      });
    };

    // 添加所有歌曲
    const addAll = () => {
      store.dispatch('addList', { list: info.hotSongs });
    };

    // 初始化
    onMounted(() => {
      info.sUid = route.query.id;
      info.type = route.query.type || 'hot';

      init();
      route.query.type && getArtists();
    });

    return {
      ...toRefs(info),
      loadMv,
      currentChange,
      changeType,
      moreDesc,
      getArtistSub,
      playAllSongs,
      addAll,
    };
  },

  beforeDestroy() {
    clearTimeout(this.timer);
  },
};
</script>
<style scoped lang="less">
.pagination {
  padding: 50px 0 0;
  text-align: center;
  display: flex;
  justify-content: center;
  :deep(.pag) {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    li.active,
    li:hover {
      color: #49a1ff;
      text-align: none;
      background: white;
      border: #ddd;
      cursor: pointer;
    }
    button.disabled {
      color: #868e96;
    }
  }
  :deep(button) {
    padding: 0;
    margin: 0;
    list-style: none;
    border: none;
    background: white;
    display: inline-block;
  }
  :deep(ul li) {
    list-style: none;
    display: inline-block;
    margin: 0 20px;
  }
}

.singer {
  background: #f8f8f8;

  .singer-btn {
    display: inline-block;
    line-height: 16px;
    align-items: center;
    border-radius: 50px;
    padding: 7px 15px;
    cursor: pointer;
    margin: 5px 0 5px 15px;
    background: #fff;
    color: #333;
  }

  .play-all,
  .icon-audio-play {
    font-size: 14px;
    color: #fff;
    background: @color-theme;
  }

  .add-all,
  .collect-all {
    font-size: 14px;
    background: #f0f0f0;
  }
}
.singer-info {
  display: flex;
  padding: 40px 0;

  .singer-avatar {
    width: 200px;
    height: 200px;
    border-radius: 100%;
    overflow: hidden;

    img {
      width: 100%;
      transition: all 1s;

      &:hover {
        transform: scale(1.1);
      }
    }
  }

  .singer-desc {
    flex: 1;
    padding-left: 50px;
  }

  .singer-author {
    padding-bottom: 16px;
  }

  .singer-name {
    display: inline-block;
    font-size: 40px;
    font-weight: 600;
    line-height: 40px;
    margin-right: 20px;
    vertical-align: top;
  }

  .singer-collect {
    &.active,
    .icon-collect-active {
      color: @color-theme;
    }
  }

  .singer-brief {
    line-height: 24px;
    color: #999;

    span {
      color: @color-theme;
      cursor: pointer;
    }
  }
}
.singer-main {
  padding: 50px 0 80px;
  background: #fff;
}
.singer-hd {
  display: flex;
  font-size: 0;

  em {
    display: inline-block;
    width: 85px;
    font-size: 28px;
    line-height: 28px;
    font-style: normal;
  }

  .singer-tab {
    flex: 1;
  }

  span {
    display: inline-block;
    font-size: 16px;
    margin: 0 24px;
    color: #666;
    cursor: pointer;

    &.active {
      position: relative;
      z-index: 1;
      font-weight: 600;
      color: #000;
      &:after {
        position: absolute;
        content: '';
        left: 0;
        bottom: 1px;
        width: 100%;
        height: 6px;
        background: @color-theme;
        z-index: -1;
      }
    }
  }
}
:deep(.el-dialog) {
  position: absolute;
  top: 0;
  left: 25%;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 1px 10px 10px 1px rgba(170, 170, 170, 0.514);
  padding: 20px;
}

:deep(.el-dialog__header) {
  text-align: center;
  font-weight: bolder;
  padding-bottom: 10px;
}
:deep(.el-dialog__headerbtn) {
  position: absolute;
  top: 0px;
  right: 10px;
  padding: 0;
  background: 0 0;
  border: none;
  outline: 0;
  cursor: pointer;
  font-size: 30px;
}
.artist-desc-main {
  max-height: 500px;
  overflow-y: auto;
}
.introduction {
  dt {
    position: relative;
    padding: 10px;
    line-height: 14px;
    padding-bottom: 10px;
    color: #333;
    font-weight: bold;
    font-size: 14px;

    &::before {
      display: inline-block;
      content: '';
      width: 4px;
      height: 14px;
      margin-right: 10px;
      vertical-align: top;
      border-radius: 4px;
      background: @color-theme;
    }
  }

  dd {
    padding-bottom: 20px;
    font-size: 12px;
    line-height: 25px;
    white-space: pre-line;
    color: #666;
  }
}
</style>
