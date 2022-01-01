<template>
  <el-skeleton :loading="loading" animated :throttle="500" :count="count">
    <template #template>
      <div class="ske-item">
        <el-skeleton-item class="ske-img" variant="image" />
        <div class="ske-info">
          <el-skeleton-item class="ske-name" variant="h3" />
          <el-skeleton-item
            class="ske-rcmdtext"
            variant="h3"
            style="width: 50%"
          />
          <el-skeleton-item class="ske-count" variant="h5" />
        </div>
      </div>
    </template>
    <template #default>
      <div class="dj">
        <!-- 图片 -->
        <router-link
          :to="{ path: '/dj', query: { id: item.id } }"
          class="item"
          v-for="item in list"
          :key="item.id"
        >
          <div class="face-img">
            <img :src="item.picUrl + '?params=120y120'" />
          </div>
          <!-- 信息 -->
          <div class="info">
            <div class="dj-name" v-if="item.name">{{ item.name }}</div>
            <div class="dj-rcmdtext" v-if="item.rcmdtext">
              {{ item.rcmdtext }}
            </div>
            <div class="dj-count">
              <span>共{{ $utils.formatNum(item.programCount) }}期</span>
              <span>订阅 {{ $utils.formatNum(item.subCount) }}次</span>
            </div>
          </div>
        </router-link>
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

    // 热门电台
    const info = reactive({
      list: [],
      params: { limit: 6 },
      count: 6,
      loading: true,
    });

    //获取热门电台
    const getHotDj = async (params) => {
      const { data: res } = await proxy.$http.getHotDj(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info['list'] = res.djRadios;
      info['loading'] = false;
    };

    onMounted(() => {
      getHotDj(info['params']);
    });

    return {
      ...toRefs(info),
    };
  },
};
</script>

<style lang="less" scoped>
.dj {
  display: block;
  flex-wrap: wrap;
  font-size: 0;
  .item {
    display: inline-flex;
    width: 50%;
    margin-bottom: 20px;
  }

  .face-img {
    width: 100px;
    height: 100px;
    border-radius: 4px;
    overflow: hidden;
    img {
      width: 100%;
    }
  }

  .info {
    flex: 1;
    padding: 5px 0;
    margin: 0 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-around;
    flex-direction: column;
  }

  .dj-name {
    font-size: 18px;
    font-weight: bold;
  }

  .dj-rcmdtext {
    font-size: 14px;
    color: #666;
  }

  .dj-count {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #999;
  }
}

.el-skeleton {
  width: auto;
  display: block;
  flex-wrap: wrap;
  font-size: 0;

  .ske-item {
    display: inline-flex;
    width: 50%;
    margin-bottom: 20px;
  }

  .ske-img {
    width: 120px;
    height: 120px;
    border-radius: 4px;
    overflow: hidden;
  }

  .ske-info {
    flex: 1;
    padding: 10px 0;
    margin: 0 15px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-around;
    flex-direction: column;
  }
}
</style>
