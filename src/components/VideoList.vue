<template>
  <el-skeleton :loading="loading" animated :throttle="500" :count="num">
    <template #template>
      <div class="item">
        <el-skeleton-item class="ske-img" variant="h3" />
        <div class="skeinfo">
          <el-skeleton-item variant="h3" class="ske-name" />
          <el-skeleton-item variant="h4" class="ske-txt" style="width: 50%" />
          <el-skeleton-item variant="h5" class="ske-txt" />
        </div>
      </div>
    </template>
    <template #default>
      <div class="video">
        <div
          class="item"
          v-for="(item, index) in videoList"
          :key="'' + item.id + index"
        >
          <!-- 视频&mv -->
          <router-link
            :to="{
              path: item.type ? '/video' : '/mv',
              query: { id: item.vid },
            }"
            class="face-img"
          >
            <i class="iconfont icon-play"></i>
            <img :src="item.coverUrl" alt="" />
            <span class="play-count">
              <i class="iconfont icon-video"></i>
              <em>
                {{ $utils.formatNum(item.playTime) }}
              </em>
            </span>
            <div class="v-time">
              {{ $utils.formatSongTime(item.durationms) }}
            </div>
          </router-link>
          <div class="info">
            <!-- 视频 -->
            <router-link
              :to="{
                path: '/video',
                query: { id: item.vid },
              }"
              class="v-name"
            >
              {{ item.title }}
            </router-link>
            <!-- 用户 -->
            <router-link
              :to="{ path: '/user', query: { uid: author.userId } }"
              class="v-author"
              v-for="(author, k) in item.creator"
              :key="k"
            >
              {{ k !== 0 ? ' / ' + author.userName : 'By.' + author.userName }}
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </el-skeleton>
</template>
<script>
export default {
  name: 'VideoList',
  props: {
    videoList: Array,
    num: Number,
    loading: Boolean,
  },
};
</script>
<style scoped lang="less">
.video {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: left;
  padding-bottom: 40px;
  margin: 0 -10px;
  font-size: 0;

  .item {
    flex: 30%;
    max-width: calc(100% / 5 - 20px);
    margin: 20px 10px 0;
    border-radius: 4px;

    &:hover {
      img {
        transform: scale(1.1);
      }

      .icon-play {
        opacity: 1;
        transform: scale(1);
      }
    }
  }

  .face-img {
    display: block;
    position: relative;
    width: 100%;
    height: 123px;
    overflow: hidden;
  }

  .play-count {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 4;
    font-size: 12px;
    display: block;
    width: 45%;
    text-align: center;
    color: #fff;
    line-height: 30px;
    border-radius: 0 4px 0 0;
    /* Permalink - use to edit and share this gradient: https://colorzilla.com/gradient-editor/#000000+0,000000+100&0+0,0.5+97 */
    background: -moz-linear-gradient(
      left,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.5) 97%,
      rgba(0, 0, 0, 0.5) 100%
    ); /* FF3.6-15 */
    background: -webkit-linear-gradient(
      left,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.5) 97%,
      rgba(0, 0, 0, 0.5) 100%
    ); /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.5) 97%,
      rgba(0, 0, 0, 0.5) 100%
    ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#00000000', endColorstr='#80000000',GradientType=1 ); /* IE6-9 */

    .icon-video {
      font-size: 18px;
      color: #fff;
    }

    em {
      display: inline-block;
      padding-left: 5px;
      font-style: normal;
    }
  }

  .v-time {
    position: absolute;
    left: 10px;
    bottom: 10px;
    z-index: 4;
    font-size: 14px;
    color: #fff;
    text-shadow: -2px 1px rgba(0, 0, 0, 0.4);
  }

  .icon-play {
    position: absolute;
    top: 50%;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 3;
    margin-top: -30px;
    font-size: 60px;
    text-align: center;
    color: #fff;
    opacity: 0;
    transform: scale(0.5);
    transition: all 0.4s linear;
    text-shadow: 2px 2px 10px #000;
  }

  img {
    height: 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    z-index: 2;
    transition: all 0.4s linear;
  }

  .info {
    position: relative;
    padding: 15px 0;

    .v-name {
      display: block;
      font-size: 14px;
    }

    .v-author {
      display: inline-block;
      line-height: 24px;
      font-size: 14px;
      color: #999;
    }
  }
}
.el-skeleton {
  display: flex;
  width: auto;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content: left;
  margin: 0 -10px;
  font-size: 0;

  .item {
    flex: 30%;
    max-width: calc(100% / 5 - 20px);
    margin: 20px 10px 0;
    border-radius: 4px;
  }

  .ske-img {
    display: block;
    position: relative;
    width: 100%;
    height: 123px;
    overflow: hidden;
  }

  .ske-info {
    position: relative;
    padding: 15px 0;
  }

  .ske-name {
    display: block;
    margin: 0 0 6px;
    line-height: 14px;
    height: 14px;
  }

  .ske-txt {
    display: block;
    margin: 0 0 8px 0;
    line-height: 16px;
    width: 10%;
  }
}
</style>
