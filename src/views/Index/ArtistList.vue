<template>
  <!-- 歌手轮播 -->
  <el-skeleton :loading="loading" animated :throttle="500" :count="count">
    <template #default>
      <el-carousel
        height="340px"
        class="artist"
        :interval="8000"
        arrow="never"
        indicator-position="outside"
      >
        <el-carousel-item
          class="box"
          v-for="(list, index) in lists"
          :key="index"
        >
          <router-link
            :to="{ path: '/singer', query: { id: item.id } }"
            v-for="item in list"
            :key="item.id"
            class="item"
          >
            <div class="face-img">
              <img :src="item.picUrl + '?params=100y100'" />
            </div>
          </router-link>
        </el-carousel-item>
      </el-carousel>
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

    // 热门歌手格式
    const info = reactive({
      lists: [],
      params: { limit: 27 },
      count: 9,
      loading: true,
    });

    // 热门歌手
    const getArtists = async (params) => {
      const { data: res } = await proxy.$http.topArtists(params);

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info['lists'] = splitGroup(res.artists, 9);
      info['loading'] = false;
    };

    // 分组
    const splitGroup = (array, subGroupLength) => {
      let index = 0;
      let newArray = [];
      while (index < array.length) {
        newArray.push(array.slice(index, (index += subGroupLength)));
      }
      return newArray;
    };

    onMounted(() => {
      getArtists(info['params']);
    });

    return {
      ...toRefs(info),
    };
  },
};
</script>

<style lang="less" scoped>
.artist {
  width: 360px;
  overflow: hidden;
  flex-wrap: nowrap;
  display: flex;
  position: relative;
}
.box {
  position: absolute;
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  justify-content: space-between;
  width: 360px;
  text-align: center;
}
:deep(ul) {
  margin: 330px 110px 0 130px;
}
.face-img {
  width: 100px;
  height: 100px;
  img {
    width: 100%;
    height: 90%;
    border-radius: 4px;
  }
}

.el-skeleton {
  display: flex;
  flex-wrap: wrap;
  align-content: space-between;
  justify-content: space-around;
  height: 340px;

  .ske-img {
    width: 100px;
    height: 100px;
  }
}
</style>
