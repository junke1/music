<template>
  <el-skeleton :loading="loading" animated :throttle="500" :count="4">
    <template #template>
      <div class="ske-item">
        <el-skeleton-item class="ske-main" variant="h2" />
      </div>
    </template>
    <template #default>
      <div class="toplist">
        <div v-for="item in top_list" :key="item.id" class="toplist-item">
          <div class="cover-img">
            <img :src="item.coverImgUrl" />
          </div>
          <div class="toplist-wrapper">
            <!-- 排行榜名 -->
            <h4 class="toplist-hd">{{ item.name }}</h4>
            <!-- 歌 -->
            <div class="toplist-songlist">
              <div
                class="song-item"
                v-for="(songItem, index) in songList[item.id]"
                :key="songItem.id"
              >
                <div class="song-num">{{ index + 1 }}</div>
                <!-- 歌曲信息 -->
                <div class="songinfo">
                  <router-link
                    :to="{
                      path: '/song',
                      query: { id: songItem.id },
                    }"
                    class="song-title"
                  >
                    {{ songItem.name }}
                  </router-link>
                  <!-- 歌手 -->
                  <div class="song-author">
                    <router-link
                      :to="{ path: '/singer', query: { id: author.id } }"
                      class="song-name"
                      v-for="(author, k) in songItem.ar"
                      :key="k"
                    >
                      {{ k !== 0 ? '/ ' + author.name : author.name }}
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </el-skeleton>
</template>
<script>
import {
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from '@vue/runtime-core';

export default {
  setup() {
    const { proxy } = getCurrentInstance();
    const info = reactive({
      top_list: [],
      songList: {},
      loading: true,
    });

    // 热门歌曲
    const getToplist = async () => {
      const { data: res } = await proxy.$http.toplist();

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info['top_list'] = res.list.splice(0, 4);
      info['top_list'].forEach(async (item) => {
        const { data: res } = await proxy.$http.topRankList({ id: item.id });
        info['songList'][item.id] = res.playlist.tracks.splice(0, 6);
      });

      info['loading'] = false;
    };

    onMounted(() => {
      getToplist();
    });

    return {
      ...toRefs(info),
    };
  },
};
</script>
<style lang="less" scoped>
.toplist {
  display: flex;
}
.toplist-item {
  flex: 1;
  position: relative;
  margin-bottom: 30px;
  margin: 0 10px;
  overflow: hidden;

  .cover-img {
    position: absolute;
    top: 0;
    right: 10px;
    left: 10px;
    z-index: 1;
    height: 100%;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2;
      content: '';
      width: 100%;
      height: 100%;
    }

    :deep(img) {
      filter: blur(60px);
      transform: scale(1.5);
    }
  }

  .toplist-wrapper {
    position: relative;
    z-index: 2;
  }

  &:hover {
    :deep(img) {
      transform: scale(2);
    }
  }
}

.toplist-wrapper {
  padding: 30px 40px;
  height: 505px;

  .toplist-hd {
    position: relative;
    font-size: 24px;
    text-align: center;
    color: #fff;

    &::after {
      display: inline-block;
      content: '';
      position: absolute;
      bottom: -30px;
      left: 0;
      right: 0;
      width: 30px;
      height: 2px;
      margin: 0 auto;
      background-color: #fff;
    }
  }

  .toplist-songlist {
    padding-top: 80px;
  }

  .song-item {
    display: flex;
    padding-bottom: 20px;
    color: #fff;

    .song-num {
      padding-right: 10px;
      font-size: 18px;
    }

    .song-title {
      line-height: 24px;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      word-break: break-all;
      padding-bottom: 5px;
      font-size: 14px;
      color: #fff;
      transition: all 0.3s ease-in;
    }

    .song-author {
      display: block;
      font-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      word-break: break-all;

      a {
        display: inline-block;
        line-height: 20px;
        font-size: 14px;
        color: #fff;
      }
    }

    &:hover {
      .song-title {
        transform: translate(15px, 0);
        transition: all 0.3s ease-in;
      }
    }

    &:last-child {
      padding-bottom: 0;
    }
  }
}

.el-skeleton {
  width: auto;
  display: flex;
  flex-wrap: nowrap;
  justify-content: space-between;
  margin: 0 -10px;
  box-sizing: border-box;

  .ske-item {
    flex: 1;
    width: 25%;
    margin: 0 10px;
  }

  .ske-main {
    height: 505px;
  }
}
</style>
