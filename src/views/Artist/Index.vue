<template>
  <div class="artist">
    <div class="w1200">
      <div class="filter">
        <div class="filter-item">
          <span
            v-for="(item, index) in initial"
            :key="index"
            :class="index === initialIndex ? 'active' : ''"
            @click="selectType('initial', index)"
          >
            {{ item.label }}
          </span>
        </div>
        <div class="filter-item">
          <span
            v-for="(item, index) in area"
            :key="index"
            :class="index === areaIndex ? 'active' : ''"
            @click="selectType('area', index)"
          >
            {{ item.label }}
          </span>
        </div>
        <div class="filter-item">
          <span
            v-for="(item, index) in type"
            :key="index"
            :class="index === typeIndex ? 'active' : ''"
            @click="selectType('type', index)"
          >
            {{ item.label }}
          </span>
        </div>
      </div>
      <!-- 无限滚轮，跳转歌手页 -->
      <div class="list-container" v-infinite-scroll="loadMore">
        <router-link
          :to="{ path: '/singer', query: { id: item.id } }"
          class="item"
          v-for="item in list"
          :key="item.id"
        >
          <div class="face-img">
            <img :src="item.picUrl + '?param=120y120'" alt="" />
          </div>
          <div class="info">
            <div class="name">
              {{ item.name }}
            </div>
            <div class="album-size">专辑:{{ item.albumSize }}</div>
          </div>
        </router-link>
      </div>
      <template v-if="isLoading">
        <Loading />
      </template>
    </div>
  </div>
</template>
<script>
import {
  getCurrentInstance,
  watchEffect,
  onMounted,
  reactive,
  toRefs,
  ref,
} from 'vue';
import Loading from '@/components/Loading.vue';
export default {
  name: 'Artist',
  components: {
    Loading,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const info = reactive({
      type: [
        { label: '全部', val: -1 },
        { label: '男歌手', val: 1 },
        { label: '女歌手', val: 2 },
        { label: '乐队', val: 3 },
      ],
      area: [
        { label: '全部', val: -1 },
        { label: '华语', val: 7 },
        { label: '欧美', val: 96 },
        { label: '日本', val: 8 },
        { label: '韩国', val: 16 },
        { label: '其他', val: 0 },
      ],
      initial: [
        { label: '热门', val: -1 },
        { label: '#', val: 0 },
      ],
      typeIndex: 0,
      areaIndex: 0,
      initialIndex: 0,
      params: {
        area: '',
        type: '',
        initial: '',
        limit: 30,
        offset: 0,
      },
      list: [],
      isLoading: true,
      isLoadMv: true,
    });

    // 姓名大写信息初始化
    const readerInitial = () => {
      const alphabet = [];
      for (let i = 0; i < 26; i++) {
        alphabet.push({
          label: String.fromCharCode(65 + i),
          val: String.fromCharCode(97 + i),
        });
      }
      info.initial = [info.initial[0], ...alphabet, info.initial[1]];
    };

    // 类型
    const selectType = (type, index) => {
      info[type + 'Index'] = index;
      info.list = [];
      info.params.offset = 0;
      info.params[type] = info[type][index].val;
    };

    // 获取该类型的歌手信息
    const getArtist = async (params) => {
      const { data: res } = await proxy.$http.artistList(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.list =
        info.params.offset !== 0 ? [...info.list, ...res.artists] : res.artists;
      info.isLoadMv = !res.more;
      info.isLoading = res.more;
    };

    // 加载更多信息
    const loadMore = () => {
      info.isLoadMv = true;
      info.params.offset = info.list.length;
    };

    onMounted(() => {
      info.params.area = info.area[info.areaIndex].val;
      info.params.type = info.type[info.typeIndex].val;
      info.params.initial = info.initial[info.initialIndex].val;
      readerInitial();
    });

    // 检测这个过程
    watchEffect(() => {
      getArtist(info.params);
    });

    return {
      ...toRefs(info),
      selectType,
      getArtist,
      loadMore,
    };
  },
};
</script>
<style scoped lang="less">
.filter {
  padding: 40px 0 20px;
}
.filter-item {
  font-size: 0;
  padding-bottom: 20px;

  span {
    display: inline-block;
    padding: 0 12px;
    font-size: 14px;
    line-height: 30px;
    margin-right: 6px;
    vertical-align: top;
    cursor: pointer;
    border-radius: 3px;

    &.active {
      color: #fff;
      background: #ff641e;
    }
  }
}

.list-container {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 40px;

  .item {
    width: 120px;
    margin: 0 40px 40px;

    img {
      transition: all 0.4s linear;
    }

    &:hover {
      img {
        transform: rotateY(180deg);
      }
    }
  }

  .face-img {
    width: 120px;
    height: 120px;
    border-radius: 100%;
    overflow: hidden;
  }

  .info {
    text-align: center;

    .name {
      line-height: 28px;
      font-size: 14px;
    }

    .album-size {
      color: #999;
    }
  }
}
</style>
