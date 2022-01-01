<template>
  <div class="mv">
    <div class="w1200">
      <div class="filter">
        <div class="filter-item">
          <!-- 区域选择 -->
          <span>区域</span>
          <em
            v-for="(item, index) in area"
            :key="index"
            :class="index === areaIndex ? 'active' : ''"
            @click="selectType('area', index)"
          >
            {{ item }}
          </em>
        </div>
        <div class="filter-item">
          <!-- 类型选择 -->
          <span>类型</span>
          <em
            v-for="(item, index) in type"
            :key="index"
            :class="index === typeIndex ? 'active' : ''"
            @click="selectType('type', index)"
          >
            {{ item }}
          </em>
        </div>
      </div>
      <div class="list-container">
        <div class="list-head">
          <h2>全部MV</h2>
          <!-- 上升最快，最新 -->
          <div class="type">
            <span
              v-for="(item, index) in order"
              :key="index"
              :class="index === orderIndex ? 'active' : ''"
              @click="selectType('order', index)"
            >
              {{ item }}
            </span>
          </div>
        </div>
        <!-- 无限滚轮 -->
        <div
          class="wrapper infinite-list"
          v-infinite-scroll="loadMv"
          infinite-scroll-disabled="isLoadMv"
          infinite-scroll-distance="50"
        >
          <MvList :mvList="list" :loading="mv_loading" :num="mv_count" />
          <template v-if="mv_loading">
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
  watchEffect,
  reactive,
  toRefs,
  ref,
} from 'vue';
import MvList from '@/components/MvList.vue';
import Loading from '@/components/Loading.vue';

export default {
  name: 'Mvlist',
  components: {
    MvList,
    Loading,
  },
  setup() {
    const { proxy } = getCurrentInstance();
    const info = reactive({
      area: ['全部', '内地', '港台', '欧美', '日本', '韩国'],
      type: ['全部', '官方版', '现场版', '网易出品'],
      order: ['上升最快', , '最新'],
      areaIndex: 0,
      typeIndex: 0,
      orderIndex: 0,
      params: {
        area: '',
        type: '',
        order: '',
        limit: 30,
        offset: 0,
      },
      list: [],
      mv_count: 20,
      mv_loading: true,
      isLoading: true,
      isLoadMv: true,
    });

    // 获取mv
    const getMv = async (params) => {
      const { data: res } = await proxy.$http.mv(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.list =
        info.params.offset !== 0 ? [...info.list, ...res.data] : res.data;
      info.isLoadMv = !res.hasMore;
      info.isLoading = res.hasMore;
      info.mv_loading = false;
    };

    // 选择类型
    const selectType = (type, index) => {
      info[type + 'Index'] = index;
      info.list = [];
      info.params.offset = 0;
      info.params[type] = info[type][index];
      info.mv_loading = true;
    };

    // mv加载
    const loadMv = () => {
      info.isLoadMv = true;
      info.params.offset = info.list.length;
    };

    // 初始化类型
    onMounted(() => {
      info.params.area = info.area[info.areaIndex];
      info.params.type = info.type[info.typeIndex];
      info.params.order = info.order[info.orderIndex];
    });

    // 检测这个过程
    watchEffect(() => {
      getMv(info.params);
    });

    return {
      ...toRefs(info),
      selectType,
      loadMv,
    };
  },
};
</script>
<style scoped lang="less">
.list-container {
  padding-bottom: 40px;
}
.filter {
  padding: 40px 0 20px;
}
.filter-item {
  font-size: 0;
  padding-bottom: 20px;

  span {
    display: inline-block;
    width: 65px;
    font-size: 14px;
    line-height: 30px;
    font-weight: bold;
    vertical-align: top;
  }

  em {
    display: inline-block;
    font-size: 14px;
    line-height: 30px;
    padding: 0 10px;
    margin-right: 15px;
    font-style: normal;
    cursor: pointer;
    border-radius: 3px;

    &.active {
      color: #fff;
      background: #ff641e;
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
