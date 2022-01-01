<template>
  <div class="w1200" v-if="userInfo">
    <div class="user-info">
      <div class="avatar-img">
        <img :src="userInfo.avatarUrl" />
      </div>
      <div class="info-desc">
        <div class="info-name">
          <h1>{{ userInfo.nickname }}</h1>
          <p>性别: {{ userInfo.gender === 1 ? '男生' : '女生' }}</p>
        </div>
        <div class="info-event">
          <div class="event">
            <h1>{{ userInfo.eventCount }}</h1>
            <p>动态</p>
          </div>
          <div class="follow">
            <h1>{{ userInfo.follows }}</h1>
            <p>关注</p>
          </div>
          <div class="followed">
            <h1>{{ userInfo.followeds }}</h1>
            <p>粉丝</p>
          </div>
        </div>
        <div class="signture">
          <p>
            介绍:
            {{
              userInfo.signature
                ? userInfo.signature
                : '这个人很懒，什么都没有留下。'
            }}
          </p>
        </div>
      </div>
    </div>
    <div class="user-main" v-if="playlist.length">
      <div class="main-title">
        <h1>{{ userInfo.nickname }}创建的歌单</h1>
      </div>
      <div class="main-item">
        <div class="playlist-item" v-for="item in playlist" :key="item.id">
          <router-link
            :to="{ path: '/playlist/detail', query: { id: item.id } }"
          >
            <div class="item-img">
              <img :src="item.coverImgUrl" alt="" />
            </div>
            <div class="item-info">
              {{ item.name }}
            </div>
          </router-link>
        </div>
        <!-- <SongList :songList="songList" :stripe="true" :typeSize="'recent'" /> -->
      </div>
    </div>
    <div class="user-else" v-else>
      <h1>{{ userInfo.nickname }}还没创建自己的歌单</h1>
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
} from 'vue';
// import { useStore } from 'vuex';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
// import SongList from '@/components/SongList.vue';

export default {
  name: 'UserInfo',
  // components: { SongList },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const info = reactive({
      songList: [],
      userInfo: {},
      playlist: [],
    });

    // 获取用户信息;
    const userInfos = async (id) => {
      const { data: res } = await proxy.$http.getUserInfo({
        uid: id,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.userInfo = res.profile;
    };

    // 获取用户歌单
    const userPlayList = async (id) => {
      const { data: res } = await proxy.$http.playlistUser({
        uid: id,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.playlist = res.playlist.splice(0, 3);
    };

    // 获取最近播放歌曲
    const recentSong = async () => {
      const { data: res } = await proxy.$http.recentSong({
        limit: 20,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.songList = res.data.list.map((item) => {
        return {
          id: String(item.data.id),
          name: item.data.name,
          mvId: item.data.mvid,
          singer: item.data.ar,
          album: item.data.al,
          alia: item.data.alia,
          duration: proxy.$utils.formatSongTime(item.data.duration),
          url: `https://music.163.com/song/media/outer/url?id=${item.data.id}.mp3`,
          vip: item.data.fee === 1,
          license: item.data.license,
          publishTime: item.data.publishTime,
          playTime: proxy.$utils.formatDate(item.playTime, 'yyyy-mm-dd'),
        };
      });
    };

    const init = (id) => {
      recentSong();
      userInfos(id);
      userPlayList(id);
    };

    // 更新页面
    onBeforeRouteUpdate((to) => {
      init(to.query.id);
    });

    onMounted(() => {
      init(route.query.id);
    });

    return {
      ...toRefs(info),
    };
  },
};
</script>
<style lang="less" scoped>
.user-info {
  display: flex;
  flex: 1;

  .avatar-img {
    margin-top: 50px;
    width: 250px;
    height: 250px;
    border: 1px solid #cdcdcd86;
    transition: 0.5s;
    &:hover {
      box-shadow: 0px 0px 10px #cdcdcd;
    }
    img {
      width: 100%;
      height: 100%;
    }
  }
  .info-desc {
    margin: 50px;
    width: calc(100% - 300px);
    .info-name {
      display: flex;
      padding: 0 20px 0 0;
      border-bottom: 1px solid #cdcdcd;
      height: 49px;

      h1 {
        margin-right: 10px;
      }
      p {
        padding-top: 5px;
      }
    }

    .info-event {
      display: flex;
      padding-top: 10px;
      height: 80px;
      .event,
      .follow,
      .followed {
        width: 100px;
        text-align: center;
        font-size: 24px;
        font-weight: 100;
        color: #5f5e5e;
        p {
          font-size: 14px;
        }
      }
    }
    .signture {
      padding: 10px 0 0 10px;
      width: 98%;
      min-height: 96px;
      border: 1px solid rgba(204, 204, 204, 0.438);
      color: #5f5e5e;
      transition: 0.5s;
      &:hover {
        box-shadow: 0px 0px 10px #cdcdcd;
      }
    }
  }
}
.user-main {
  .main-title {
    padding-bottom: 10px;
    border-bottom: 2px solid #ccc;
    h1 {
      color: #5f5e5e;
    }
  }
  .main-item {
    margin-top: 50px;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    .playlist-item {
      border: 1px solid #cdcdcd;
      width: 150px;
      height: 150px;
      text-align: center;
      transition: 0.5s;
      cursor: pointer;
      &:hover {
        box-shadow: 1px 1px 10px 1px #6d6b6b93;
        color: @color-theme;
      }
      img {
        width: 100%;
        height: 100%;
      }
    }
  }
}
.user-else {
  padding-bottom: 10px;
  border-bottom: 2px solid #ccc;
  h1 {
    color: #5f5e5e;
  }
}
</style>
