<template>
  <div class="search">
    <div class="search-hd">
      <!-- 搜索页 -->
      <div class="w1200">
        <div class="search-box">
          <el-popover
            placement="bottom-start"
            :width="626"
            :visible="isShowSearch"
            trigger="manual"
          >
            <!-- 输入框，输入，聚焦，关闭事件 -->
            <template #reference>
              <el-input
                class="search-inp"
                placeholder="请输入歌名/歌词/歌手/专辑"
                v-model="keyVal"
                @focus="getListHandle"
                @blur="handleClose"
                @input="getListHandle"
                clearable
              ></el-input>
            </template>
            <!-- 显示搜索结果，类型及其相应数据，点击可跳转对应页面 -->
            <div class="search-key-list">
              <div
                class="search-item"
                v-for="(item, index) in suggestInfo.order"
                :key="index"
              >
                <!-- 类型 -->
                <h6>{{ listType[item] }}</h6>
                <div class="item-main">
                  <!-- 结果 -->
                  <div
                    class="list"
                    v-for="(val, k) in suggestInfo[item]"
                    :key="k"
                    @click="jumpPage(val, item)"
                  >
                    {{ val.name }}
                    <!-- 歌曲显示所有作者 -->
                    <template v-if="item === 'songs'"
                      >-
                      <span v-for="(a, i) in val.artists" :key="i">
                        {{ a.name + (i !== 0 ? ' / ' : '') }}
                      </span>
                    </template>
                    <!-- 专辑显示单个作者 -->
                    <template v-else-if="item === 'albums'"
                      >-
                      <span>
                        {{ val.artist.name }}
                      </span>
                    </template>
                  </div>
                </div>
              </div>
            </div>
          </el-popover>
        </div>
      </div>
    </div>

    <div class="w1200">
      <div class="search-main">
        <div class="search-tab">
          <h2>
            搜索结果<em> ({{ searchInfo }}) </em>
          </h2>
          <div class="type">
            <!-- 点击切换不同的搜索结果 -->
            <span
              :class="type === '1' ? 'active' : ''"
              @click="selectType('1')"
            >
              单曲
            </span>
            <span
              :class="type === '10' ? 'active' : ''"
              @click="selectType('10')"
            >
              专辑
            </span>
            <span
              :class="type === '100' ? 'active' : ''"
              @click="selectType('100')"
            >
              歌手
            </span>
            <span
              :class="type === '1000' ? 'active' : ''"
              @click="selectType('1000')"
            >
              歌单
            </span>
            <span
              :class="type === '1004' ? 'active' : ''"
              @click="selectType('1004')"
            >
              MV
            </span>
            <span
              :class="type === '1014' ? 'active' : ''"
              @click="selectType('1014')"
            >
              视频
            </span>
          </div>
        </div>
        <!-- 根据对应的类型，引用相对应的组件 -->
        <div class="search-list">
          <SongList
            :songList="list"
            :stripe="true"
            :offset="offset"
            v-if="type === '1'"
            :display="0"
          />
          <AlbumList
            :albumList="list"
            :loading="loading"
            :num="30"
            v-if="type === '10'"
          />
          <ArtistList
            :artistList="list"
            :loading="loading"
            :num="30"
            v-if="type === '100'"
          />
          <PlayList
            :playList="list"
            :loading="loading"
            :num="30"
            v-if="type === '1000'"
          />
          <MvList
            :mvList="list"
            :loading="loading"
            :num="30"
            v-if="type === '1004'"
          />
          <VideoList
            :videoList="list"
            :loading="loading"
            :num="30"
            v-if="type === '1014'"
          />
        </div>
        <!-- 分页 -->
        <div class="pagination">
          <el-pagination
            @current-change="currentChange"
            :current-page="currentpage"
            :page-size="limit"
            layout="prev, pager, next"
            :total="total"
          ></el-pagination>
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
  onMounted,
  reactive,
  toRefs,
  ref,
  toRef,
} from 'vue';
import SongList from '@/components/SongList.vue';
import AlbumList from '@/components/AlbumList.vue';
import ArtistList from '@/components/ArtistList.vue';
import PlayList from '@/components/PlayList.vue';
import MvList from '@/components/MvList.vue';
import VideoList from '@/components/VideoList.vue';
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router';

export default {
  name: 'search',
  components: {
    SongList,
    AlbumList,
    ArtistList,
    PlayList,
    MvList,
    VideoList,
  },

  setup() {
    const route = useRoute();
    const router = useRouter();
    const { proxy } = getCurrentInstance();
    const info = reactive({
      keyVal: route.query.key,
      suggestInfo: {},
      listType: {
        songs: '单曲',
        artists: '歌手',
        albums: '专辑',
        playlists: '歌单',
      },
      type: route.query.type || '1',
      //搜索类型 默认为1单曲，
      //取值意义 : 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户,
      // 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合
      history: [],
      list: [],
      total: 0,
      offset: 0,
      limit: 30,
      currentpage: 0,
      isShowSearch: false,
      loading: true,
    });

    // 搜索类型信息
    const searchInfo = computed(() => {
      const txt = {
        1: '首单曲',
        10: '张专辑',
        100: '个歌手',
        1000: '个歌单',
        1002: '个用户',
        1004: '个MV',
        1014: '个视频',
        1018: '个',
      };

      return info.total + txt[info.type];
    });

    // 搜索框结果
    const getSearchSuggest = async () => {
      const { data: res } = await proxy.$http.searchSuggest({
        keywords: info.keyVal,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.suggestInfo = res.result;
    };

    // 下方搜索结果
    const getSearchMatch = async () => {
      const { data: res } = await proxy.$http.cloudSearch({
        keywords: info.keyVal,
        type: info.type,
        limit: info.limit,
        offset: info.offset,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      if (info.type === '1') {
        info.list = res.result.songs.map((item) => {
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
        info.total = res.result.songCount;
      } else if (info.type === '10') {
        info.list = res.result.albums;
        info.total = res.result.albumCount;
      } else if (info.type === '100') {
        info.list = res.result.artists;
        info.total = res.result.artistCount;
      } else if (info.type === '1000') {
        info.list = res.result.playlists;
        info.total = res.result.playlistCount;
      } else if (info.type === '1004') {
        info.list = res.result.mvs;
        info.total = res.result.mvCount;
      } else if (info.type === '1014') {
        info.list = res.result.videos;
        info.total = res.result.videoCount;
      }
      info.loading = false;
    };

    // 跳转对应搜索结果页面
    const jumpSearch = (k) => {
      if (!k) {
        return;
      }
      if (info.keyVal && info.keyVal !== route.query.key) {
        //  点击搜索关键词，跳转到搜索结果页面
        router.push({ path: '/search', query: { key: k, type: info.type } });
        info.isShowSearch = false;
      } else {
        info.loading = true;
        info.list = [];
        getSearchMatch();
      }
    };

    // 跳转具体的详情页面
    const jumpPage = (item, type) => {
      info.keyVal = item.name;
      switch (type) {
        case 'songs':
          router.push({ path: '/song', query: { id: item.id } });
          break;
        case 'artists':
          router.push({ path: '/singer', query: { id: item.id } });
          break;
        case 'albums':
          router.push({ path: '/album', query: { id: item.id } });
          break;
        case 'playlists':
          router.push({ path: '/playlist/detail', query: { id: item.id } });
          break;
      }
      info.isShowSearch = false;
    };

    // 获取搜索结果且显示
    const getListHandle = () => {
      if (info.keyVal) {
        info.suggestInfo = {};
        getSearchSuggest();
        info.isShowSearch = true;
      } else {
        info.isShowSearch = false;
      }
    };

    //关闭显示
    const handleClose = () => {
      info.isShowSearch = false;
    };

    // 选择类型
    const selectType = (type) => {
      info.type = type;
      info.offset = 0;
      info.currentpage = 0;
      router.push({
        path: '/search',
        query: { key: info.keyVal, type: info.type },
      });
    };

    // 分页
    const currentChange = (page) => {
      info.offset = (page - 1) * info.limit;
      info.currentpage = page;
      getSearchMatch();
    };

    onMounted(() => {
      getSearchMatch();
    });

    // 路由变化再次匹配
    onBeforeRouteUpdate((to) => {
      info.keyVal = to.query.key;
      info.type = to.query.type || '1';
      getSearchMatch();
    });

    watch(
      () => info.keyVal,
      () => {
        if (info.keyVal) {
          getSearchMatch();
        }
      }
    );

    return {
      ...toRefs(info),
      searchInfo,
      currentChange,
      getListHandle,
      handleClose,
      jumpSearch,
      jumpPage,
      selectType,
      searchInfo,
    };
  },
};
</script>
<style scoped lang="less">
.search-main {
  padding-bottom: 70px;
  display: flex;
  flex-direction: column;
}
.search-hd {
  padding: 100px 0;
  box-shadow: inset 0 -10px 20px #333;
  background: url('@assets/b.jpg') repeat-x;
  text-align: center;

  .search-inp {
    :deep(input) {
      height: 50px;
      border: 0;
      border-radius: 4px;
    }
    :deep(.el-input__suffix) {
      width: 100%;
      i {
        position: relative;
        top: 20px;
        left: 600px;
      }
    }
    :deep(.el-input-group__append) {
      background: #fff;
      border: 0;
    }
  }
}
.search-box {
  position: relative;
  width: 54.4%;
  padding-right: 50px;
  margin: 0 auto;

  .icon-search {
    position: absolute;
    right: 0;
    width: 50px;
    line-height: 50px;
    border-radius: 0 4px 4px 0;
    background: #fff;
    cursor: pointer;
  }
}
.search-item {
  border-top: solid 1px #f2f2f2;
  margin: -1px -12px 0;

  h6 {
    font-size: 14px;
    line-height: 36px;
    color: #666;
    padding: 0 12px;
  }

  .list {
    line-height: 36px;
    color: #999;
    padding: 0 12px 0 40px;
    display: block;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    cursor: pointer;

    &:hover {
      color: #fff;
      background: @color-theme;
    }
  }

  &:first-child {
    border: 0;
  }
}
.search-history {
  width: 50%;
  padding: 20px 0;
  margin: 0 auto;
  text-align: left;
  color: #ccc;
}
.search-tab {
  display: flex;
  padding: 20px 0;

  h2 {
    padding-right: 70px;
    font-size: 24px;
    line-height: 30px;

    em {
      display: inline-block;
      width: 150px;
      font-style: normal;
      font-weight: normal;
      font-size: 14px;
      padding: 0 10px;
    }
  }

  span {
    display: inline-block;
    position: relative;
    font-weight: 300;
    color: #333;
    font-size: 16px;
    margin: 0 30px;
    line-height: 30px;
    cursor: pointer;

    &.active {
      font-weight: 600;
      color: #000;

      &::after {
        position: absolute;
        content: '';
        left: 0;
        bottom: 5px;
        width: 100%;
        height: 6px;
        background: @color-theme;
        z-index: -1;
      }
    }
  }
}
.pagination {
  padding: 30px 0;
  text-align: center;
}
</style>
