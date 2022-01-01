<template>
  <el-skeleton :loading="loading" animated :count="num" :throttle="500">
    <template #template>
      <div class="item">
        <el-skeleton-item class="ske-img" variant="image" />
        <div class="ske-info">
          <el-skeleton-item class="ske-name" variant="h3" />
          <el-skeleton-item class="ske-name" variant="h3" style="width: 50%" />
          <el-skeleton-item class="ske-txt" variant="h5" />
        </div>
      </div>
    </template>
    <template #default>
      <div class="album">
        <!-- 专辑组件，显示父组件传入的专辑数据，包括专辑的图片，类型，名字，以及艺术家的名字，包括点击
              之后携带对应的id跳转到专辑页面 -->
        <router-link
          :to="{ path: '/album', query: { id: item.id } }"
          class="item"
          v-for="item in albumList"
          :key="item.id"
        >
          <div class="face-img">
            <div class="disc"></div>
            <img :src="item.picUrl + '?params=120y120'" />
          </div>
          <div class="info">
            <div class="album-type">{{ item.type }}</div>
            <div class="album-name" v-if="item.name">{{ item.name }}</div>
            <div class="artist-name" v-if="item.artist">
              {{ item.artist.name }}
            </div>
          </div>
        </router-link>
      </div>
    </template>
  </el-skeleton>
</template>

<script>
export default {
  props: {
    albumList: Array,
    num: Number,
    loading: Boolean,
  },
  setup() {},
};
</script>

<style scoped lang="less">
.album {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: left;
  padding-bottom: 40px;
  margin: 0 -10px;
  font-size: 0;

  .item {
    display: flex;
    flex: 30%;
    max-width: calc(100% / 3 - 20px);
    margin: 20px 10px 0;
    border-radius: 4px;
    background: #f0f0f0;

    &:hover {
      .album-name {
        color: @color-theme;
      }
    }
  }

  .face-img {
    display: block;
    position: relative;
    width: 120px;
    height: 120px;
    img {
      position: absolute;
      border-radius: 4px;
      z-index: 3;
      width: 100%;
      height: 100%;
    }
    .disc {
      display: inline-block;
      content: '';
      position: absolute;
      top: 0;
      right: -20px;
      width: 100%;
      height: 100%;
      background: url('@assets/img/disc.png') no-repeat;
      background-size: contain;
      transition: all 0.4s linear;
    }

    &:hover {
      .disc {
        right: -25px;
        transform: rotate(90deg);
      }
    }
  }

  .info {
    position: relative;
    flex: 1;
    margin-left: 40px;
    overflow: hidden;

    .album-name {
      padding: 30px 15px 10px 0;
      font-size: 16px;
      color: #333;
      word-break: break-all;
    }

    .artist-name {
      font-size: 14px;
      color: #999;
    }

    .album-type {
      position: absolute;
      top: 5px;
      right: -30px;
      width: 100px;
      line-height: 24px;
      font-size: 12px;
      transform: rotate(45deg);
      text-align: center;
      color: #fff;
      background-color: @color-theme;
    }
  }
}

.el-skeleton {
  display: flex;
  width: auto;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: left;
  padding-bottom: 40px;
  margin: 0 -10px;
  font-size: 0;

  .item {
    display: flex;
    flex: 30%;
    max-width: calc(100% / 3 - 20px);
    margin: 20px 10px 0;
  }

  .ske-img {
    display: block;
    position: relative;
    width: 120px;
    height: 120px;
    line-height: 150px;
    text-align: center;
  }

  .ske-info {
    position: relative;
    flex: 1;
    margin: 20px 0 0 40px;
    overflow: hidden;
  }

  .ske-name {
    margin: 5px 0;
  }

  .ske-txt {
    display: block;
    margin-top: 10px;
    width: 10%;
  }
}
</style>
