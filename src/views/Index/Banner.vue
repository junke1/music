<template>
  <div class="banner">
    <el-skeleton :loading="loading" animated>
      <!--骨架屏，#template部分占位，但加载出来后显#default -->
      <template #template>
        <el-skeleton-item variant="p" class="skeleton-item" />
        <el-skeleton-item variant="p" class="skeleton-item" />
        <el-skeleton-item variant="p" class="skeleton-item" />
      </template>
      <!-- 使用swiper轮播组件 -->
      <template #default>
        <swiper
          :slides-per-view="3"
          :space-between="30"
          :pagination="{ clickable: true }"
          :autoplay="{ delay: 3000 }"
          v-if="lists"
          ref="mySwiper"
          class="banner-wrap"
        >
          <swiper-slide v-for="item of lists" :key="item.imageUrl">
            <img
              :src="item.imageUrl"
              :alt="item.typeTitle"
              class="banner-img"
              @click="pathHandler(item)"
            />
          </swiper-slide>
        </swiper>
      </template>
    </el-skeleton>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import SwiperCore, { Pagination, Autoplay } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/vue';
import 'swiper/swiper-bundle.min.css';
SwiperCore.use([Pagination, Autoplay]);
export default {
  setup() {
    const { proxy } = getCurrentInstance();
    const router = useRouter();

    let lists = ref([]);
    let loading = ref(true);

    // 获取轮播图的图片信息
    const getBanner = async () => {
      try {
        const { data: res } = await proxy.$http.getBanner();

        if (res.code !== 200) {
          return proxy.$msg.error('数据请求失败');
        }
        lists.value = res.banners;
        loading.value = false;
      } catch (error) {
        console.log(error);
      }
    };

    // 切换不同类别路径
    const pathHandler = (params) => {
      switch (params.targetType) {
        case 1: //单曲
          router.push({ path: '/song', query: { id: params.targetId } });
          break;
        case 10: //专辑
          router.push({ path: '/album', query: { id: params.targetId } });
          break;
        case 1000: //歌单
          router.push({ path: '/playlist', query: { id: params.targetId } });
          break;
        case 1004: //MV
          router.push({ path: '/mv', query: { id: params.targetId } });
          break;
        case 3000: //外链
          window.open(params.url, '_blank');
          break;
      }
    };

    onMounted(() => {
      getBanner();
    });

    return {
      lists,
      loading,
      pathHandler,
    };
  },
  components: {
    Swiper,
    SwiperSlide,
  },
};
</script>

<style lang="less" scoped>
// 定义基础位置，大小，以及图片的高度大小，其余的轮播样式不在这里定义
.banner-wrap {
  position: relative;
  padding: 40px 0;
  height: 140px;
  font-size: 0;

  .banner-img {
    width: 100%;
    height: 100%;
  }

  .swiper-slide {
    height: 140px;
    cursor: pointer;
  }
}
// 定义式，但数据还没加载出来的样式，防止页面跳动，影响用户体验
.el-skeleton {
  display: flex;
  justify-content: space-between;
  padding: 40px 0;

  .skeleton-item {
    flex: 1;
    height: 140px;
    background: rgb(243, 242, 242);
    margin-right: 30px;
    &:last-child {
      margin: 0;
    }
  }
}
</style>
