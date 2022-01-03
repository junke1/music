<template>
  <div class="home">
    <div class="w1200">
      <Banners />

      <div class="hot-list">
        <div class="h-title">
          <h3>热门歌单</h3>
          <span
            v-for="(item, index) in playlist_tags"
            :key="item.id"
            :class="index == playlist_index ? 'active' : ''"
            @click="choosePlayListType(index)"
          >
            {{ item.name }}
          </span>
        </div>
        <div class="wrapper">
          <PlayList
            :playList="playlist_list"
            :loading="playlist_loading"
            :num="playlist_count"
          />
        </div>
      </div>
      <div class="album-list">
        <div class="h-title">
          <h3>新碟上碟</h3>
          <span
            v-for="(item, index) in album_area"
            :key="item.id"
            :class="index == album_index ? 'active' : ''"
            @click="chooseAlbumType(index)"
          >
            {{ item.name }}
          </span>
        </div>
        <div class="wrapper">
          <AlbumList
            :albumList="album_list"
            :loading="album_loading"
            :num="album_count"
          />
        </div>
      </div>
      <div class="top-list">
        <div class="h-title">
          <h3>排行榜</h3>
        </div>
        <div class="wrapper">
          <RankList />
        </div>
      </div>
      <div class="mv-list">
        <div class="h-title">
          <h3>最新MV</h3>
          <span
            v-for="(item, index) in mv_area"
            :key="item.id"
            :class="index == mv_index ? 'active' : ''"
            @click="chooseMvType(index)"
          >
            {{ item }}
          </span>
        </div>
        <div class="wrapper">
          <MvList :mvList="mv_list" :loading="mv_loading" :num="mv_count" />
        </div>
      </div>
      <div class="dj-artist">
        <div class="dj-list">
          <h3>热门电台</h3>
          <DjList />
        </div>
        <div class="artist-list">
          <h3>热门歌手</h3>
          <ArtistList />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, reactive, toRefs, ref } from 'vue';
import Banners from '@views/Index/Banner.vue';
import RankList from '@views/Index/RankList.vue';
import DjList from '@views/Index/DjList.vue';
import ArtistList from '@views/Index/ArtistList.vue';
import PlayList from '@components/PlayList.vue';
import AlbumList from '@components/AlbumList.vue';
import MvList from '@components/MvList.vue';

export default {
  setup() {
    const { proxy } = getCurrentInstance();

    // 歌单
    // 热门歌单
    const playlist_info = reactive({
      playlist_tags: [],
      playlist_list: [],
      playlist_index: 0,
      playlist_params: { limit: 5, offset: 0 },
      playlist_count: 5,
      playlist_loading: true,
    });

    // 获取热门歌单标签
    const getHotTags = async () => {
      const { data: res } = await proxy.$http.hotList();

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      res.tags.unshift({ name: '为您推荐' });
      playlist_info['playlist_tags'] = res.tags.splice(0, 6);
    };

    // 分类歌单列表
    const getPlayList = async (params) => {
      const { data: res } = await proxy.$http.playList(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      // 取到数据后将数据赋值给playlist_list，然后已不在加载状态，把loading设置为false
      playlist_info['playlist_list'] = res.playlists;
      playlist_info['playlist_loading'] = false;
    };

    // 切换歌单类别、
    const choosePlayListType = (index) => {
      playlist_info['playlist_index'] = index;
      playlist_info['playlist_params']['cat'] =
        index !== 0 ? playlist_info['playlist_tags'][index].name : '';
      playlist_info['playlist_loading'] = true;
      getPlayList(playlist_info['playlist_params']);
    };

    //  ---新碟
    // 热门卡碟
    const album_info = reactive({
      album_area: proxy.$COMMON.ALBUM_AREA,
      album_list: [],
      album_index: 0,
      album_params: { limit: 9 },
      album_count: 9,
      album_loading: true,
    });

    // 新碟上架
    const getAlbumList = async (params) => {
      const { data: res } = await proxy.$http.topAlbum(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      album_info['album_list'] = res.monthData.slice(0, 9);
      album_info['album_loading'] = false;
    };

    // 切换卡碟类别
    const chooseAlbumType = (index) => {
      album_info['album_index'] = index;
      album_info['album_params']['area'] =
        index !== 0 ? album_info['album_area'][index].code : '';
      album_info['album_loading'] = true;
      getAlbumList(album_info['album_params']);
    };

    // MV-------
    // MV
    const mv_info = reactive({
      mv_area: proxy.$COMMON.MV_AREA,
      mv_list: [],
      mv_index: 0,
      mv_params: { limit: 10 },
      mv_count: 10,
      mv_loading: true,
    });

    // 最新MV
    const getMv = async (params) => {
      const { data: res } = await proxy.$http.getNewMv(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      mv_info['mv_list'] = res.data;
      mv_info['mv_loading'] = false;
    };

    // 切换Mv类别
    const chooseMvType = (index) => {
      mv_info['mv_index'] = index;
      mv_info['mv_params']['area'] =
        index !== 0 ? mv_info['mv_area'][index] : '';
      mv_info['mv_loading'] = true;
      getMv(mv_info['mv_params']);
    };

    onMounted(() => {
      getHotTags();
      getPlayList(playlist_info['playlist_params']);
      getAlbumList(album_info['album_params']);
      getMv(mv_info['mv_params']);
    });

    return {
      ...toRefs(playlist_info),
      ...toRefs(album_info),
      ...toRefs(mv_info),
      choosePlayListType,
      chooseAlbumType,
      chooseMvType,
    };
  },
  components: {
    Banners,
    PlayList,
    DjList,
    ArtistList,
    AlbumList,
    MvList,
    RankList,
  },
};
</script>
<style lang="less" scoped>
.h-title {
  padding: 20px 0 0;
  text-align: center;

  h3 {
    padding: 20px 0;
    font-size: 28px;
    font-weight: 700;
  }

  span {
    display: inline-block;
    font-size: 16px;
    margin: 0 24px;
    color: #333;
    cursor: pointer;

    &.active {
      position: relative;
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

.dj-artist {
  margin: 40px 0;
  position: relative;
  display: inline-block;
  .dj-list {
    width: 66%;
    float: left;
  }
  .artist-list {
    float: right;
  }
  h3 {
    padding: 20px 0;
    font-size: 28px;
    font-weight: 700;
  }
}
</style>
