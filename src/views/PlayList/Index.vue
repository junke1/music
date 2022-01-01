<template>
  <div class="playlist">
    <div class="w1200">
      <div class="filter">
        <!-- 歌单类型 -->
        <div
          class="filter-item"
          v-for="(item, index) in categories"
          :key="index"
        >
          <div class="filter-title">
            {{ item.name }}
          </div>
          <div class="filter-box">
            <span
              :class="['item-box', curType === sub.name ? 'active' : '']"
              v-for="sub in item.children.slice(0, 8)"
              :key="sub.name"
            >
              <em @click="selectType(sub)">
                {{ sub.name }}
              </em>
            </span>
            <el-popover trigger="click" :width="300">
              <template #reference>
                <span
                  :class="[
                    'item-box',
                    'filter-more',
                    moreTxt[index] ? 'active' : '',
                  ]"
                  v-if="item.children.length > 9"
                >
                  <em>
                    {{ moreTxt[index] ? curType : '更多' }}
                    <i class="iconfont icon-arrow"></i>
                  </em>
                </span>
                <span v-else></span>
              </template>
              <!-- 更多 -->
              <div class="filter-drop">
                <span
                  :class="['item-box', curType === sub.name ? 'active' : '']"
                  v-for="sub in item.children.slice(9)"
                  :key="sub.name"
                >
                  <em @click="selectType(sub, index)">
                    {{ sub.name }}
                  </em>
                </span>
              </div>
            </el-popover>
          </div>
        </div>
      </div>
      <div class="list-container">
        <div class="list-head">
          <!-- 当前类型 -->
          <h2>
            {{ curType }}
            <em
              class="filter-close"
              v-if="curType !== allList.name"
              @click="closed"
            >
              <i class="iconfont icon-closed"></i>
            </em>
          </h2>
          <div class="type">
            <span
              :class="params.order === 'hot' ? 'active' : ''"
              @click="selectOrder('hot')"
              >热门</span
            >
          </div>
        </div>
        <!-- 无限滚轮 -->
        <div
          class="wrapper infinite-list"
          v-infinite-scroll="loadMore"
          infinite-scroll-disabled="busy"
          infinite-scroll-distance="100"
        >
          <PlayList
            :loading="playlist_loading"
            :playList="playlist_list"
            :num="playlist_count"
          />
          <template v-if="busy">
            <Loading />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getCurrentInstance,
  onMounted,
  computed,
  watch,
  reactive,
  toRefs,
  ref,
} from 'vue';
import PlayList from '@/components/PlayList.vue';
import Loading from '@/components/Loading.vue';
import { useRoute, useRouter } from 'vue-router';

export default {
  name: 'PlayListWrap',
  components: {
    PlayList,
    Loading,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const router = useRouter();
    const cat = route.query.cat;
    const info = reactive({
      sub: [],
      categories: [],
      curType: '',
      moreTxt: {},
      allList: {},
      playlist_list: [],
      playlist_count: 20,
      playlist_loading: true,
      busy: true,
      // 默认参数
      params: {
        order: 'hot',
        cat: cat,
        limit: 50,
        offset: 0,
      },
    });

    const getCatlist = async () => {
      const { data: res } = await proxy.$http.catlist();
      info.sub = res.sub;

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      for (const k in res.categories) {
        const params = { name: res.categories[k] };

        params.children = info.sub.filter((subItem) => {
          return subItem.category === Number(k);
        });
        info.categories.push(params);
      }

      info.curType = cat ? cat : res.all.name;
      info.allList = res.all;
      getMoreTxt();
    };

    // 选择类型
    const selectType = (item) => {
      router.push({
        path: 'playlist',
        query: { cat: item.name, order: info.params.order },
      });
    };

    // 删除类型标签
    const closed = () => {
      router.push({ path: 'playlist' });
    };

    // 选择类型
    const selectOrder = (type) => {
      router.push({
        path: 'playlist',
        query: { cat: info.params.cat, order: type },
      });
    };

    const getMoreTxt = () => {
      // 查询当前显示的歌单分类详情，如： 全部歌单/华语
      const itemInfo = info.sub.find((subItem) => {
        return subItem.name === info.curType;
      });
      info.moreTxt = {};
      if (itemInfo) {
        // 若有歌单分类，且分类歌单的索引在更多里面，则渲染moreTxt数据
        const index =
          info.categories[itemInfo.category].children.indexOf(itemInfo);
        index >= 8 && (info.moreTxt[itemInfo.category] = itemInfo);
      }
    };

    // 歌单
    const getPlayList = async (params) => {
      const { data: res } = await proxy.$http.playList(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.playlist_list =
        info.params.offset !== 0
          ? [...info.playlist_list, ...res.playlists]
          : res.playlists;
      info.busy = info.playlist_list.length >= res.total;
      info.playlist_loading = false;
    };

    const loadMore = () => {
      info.busy = true;
      info.params.offset = info.playlist_list.length;
    };

    onMounted(() => {
      getCatlist();
      getPlayList(info.params);
    });

    watch(
      () => route.query,
      (newVal, oldVal) => {
        const { cat, order } = newVal;

        info.curType = cat || info.allList.name;
        info.params = Object.assign(
          {},
          { order: 'hot', cat: '', limit: 50, offset: 0 },
          { cat: cat || '', order: order || 'hot' }
        );
        getMoreTxt();
      }
    );

    watch(
      () => info.params,
      (newVal, oldVal) => {
        if (newVal.cat !== oldVal.cat) {
          info.busy = true;
          info.playlist_list = [];
        }
        getPlayList(newVal);
      },
      {
        deep: true,
      }
    );
    return {
      ...toRefs(info),
      getCatlist,
      selectType,
      closed,
      loadMore,
      selectOrder,
    };
  },
};
</script>
<style scoped lang="less">
.wrapper {
  min-height: 500px;
}
.filter {
  display: flex;
  padding: 40px 0;
}
.filter-item {
  flex: 2;
  border-left: 1px solid #f5f5f5;
  padding-left: 35px;

  .filter-title {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .filter-box {
    font-size: 0;
  }

  .item-box {
    display: inline-block;
    width: calc(100% / 3);
    vertical-align: top;

    em {
      display: inline-block;
      font-style: normal;
      font-size: 14px;
      line-height: 26px;
      margin-top: 4px;
      cursor: pointer;
    }

    &.active {
      em {
        padding: 0 6px 0 5px;
        margin: 4px -5px 0;
        color: #fff;
        font-style: normal;
        background: @color-theme;
      }
    }
  }

  .filter-more {
    width: 50px;

    &.active {
      em {
        width: 40px;
        overflow: hidden;
        height: 26px;
        text-overflow: ellipsis;
        white-space: nowrap;
        vertical-align: top;
      }
    }
  }

  &:first-child {
    flex: 1;
    border: 0;
    padding-left: 0;

    .item-box {
      width: 50%;
    }
  }
}
.filter-drop {
  width: 300px;
  border-radius: 4px;
  text-align: center;
  .item-box {
    display: inline-block;
    line-height: 30px;
    font-size: 14px;
    width: 76px;
    height: 30px;

    em {
      display: inline-block;
      font-style: normal;
      cursor: pointer;
    }

    &.active {
      em {
        padding: 0 5px;
        margin: 0 -5px;
        color: #fff;
        font-style: normal;
        background: @color-theme;
      }
    }
  }
}

.list-head {
  display: flex;
  padding: 15px 0;

  h2 {
    font-size: 24px;
    line-height: 30px;
  }

  .filter-close {
    display: inline-block;
    line-height: 16px;
    vertical-align: top;
    cursor: pointer;
  }

  .type {
    flex: 1;
    padding: 5px 40px;

    span {
      position: relative;
      display: inline-block;
      height: 20px;
      line-height: 20px;
      margin-right: 34px;
      font-weight: 300;
      color: #333;
      cursor: pointer;

      &.active {
        font-weight: 600;
        color: #000;

        &::after {
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
}
</style>
