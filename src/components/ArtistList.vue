<template>
  <el-skeleton :loading="loading" animated :throttle="500" :count="num">
    <template #template>
      <div class="item">
        <div class="face-img">
          <el-skeleton-item class="ske-img" variant="image" />
        </div>
      </div>
    </template>
    <template #default>
      <div class="artist">
        <!-- 艺术家们组件，显示父组件传入的艺术家数据，包括专辑的图片，名字，以及艺术家的专辑数量，包括点击
              之后携带对应的id跳转到歌手页面 -->
        <router-link
          :to="{ path: '/singer', query: { id: item.id } }"
          class="item"
          v-for="item in artistList"
          :key="item.id"
        >
          <div class="face-img">
            <img :src="item.picUrl + '?param=120y120'" alt="" />
          </div>
        </router-link>
      </div>
    </template>
  </el-skeleton>
</template>
<script>
export default {
  name: 'ArtistList',
  props: {
    artistList: Array,
    num: Number,
    loading: Boolean,
  },
};
</script>
<style lang="less" scoped>
.artist {
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
}

.el-skeleton {
  display: flex;
  flex-wrap: wrap;
  padding-bottom: 40px;

  .item {
    width: 120px;
    margin: 0 40px 40px;
  }

  .ske-img {
    width: 120px;
    height: 120px;
    border-radius: 100%;
    overflow: hidden;
  }
}
</style>
