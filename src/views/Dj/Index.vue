<template>
  <div class="dj-detail" v-if="djDetails">
    <div class="w1200">
      <div class="dj-header">
        <div class="dj-info">
          <div class="dj-avatar">
            <img :src="djDetails.picUrl" alt="" />
          </div>
          <div class="dj-desc">
            <div class="info-name">
              <h1>{{ djDetails.name }}</h1>
            </div>
            <div class="author">
              <div class="author-avatar">
                <img :src="dj.avatarUrl" alt="" />
              </div>
              <router-link :to="{ path: '/user', query: { id: dj.userId } }">
                <div class="nick-name">
                  {{ dj.nickname }}
                </div></router-link
              >
            </div>
            <div class="dj-info-count">
              <span class="info-count">
                分享量: {{ $utils.formatNum(djDetails.shareCount) }}
              </span>
              <span class="info-shared">
                收藏量: {{ $utils.formatNum(djDetails.subCount) }}
              </span>
              <span class="info-program">
                收藏量: {{ $utils.formatNum(djDetails.programCount) }}
              </span>
            </div>
            <div class="dj-brief">
              {{ djDetails.desc ? djDetails.desc : '暂无简介' }}
            </div>
          </div>
        </div>
      </div>
      <div class="dj-main">
        <DjList :program="program" :userId="dj.userId" />
      </div>
    </div>
  </div>
</template>
<script>
import { getCurrentInstance, onMounted, reactive, toRefs, ref } from 'vue';
import CommentList from '@components/Comments.vue';
import DjList from '@components/DjList.vue';
import { useStore } from 'vuex';
import { onBeforeRouteUpdate, useRoute } from 'vue-router';
export default {
  name: 'dj',
  components: { CommentList, DjList },
  setup() {
    const { proxy } = getCurrentInstance();
    const route = useRoute();
    const store = useStore();
    const info = reactive({
      rId: '0',
      type: 4, // 0歌曲 1mv 2歌单 3专辑 4电台 5视频 6动态
      djDetails: {},
      dj: {},
      program: [],
      playing: false,
    });
    // 电台详情
    const getDjDetail = async () => {
      const { data: res } = await proxy.$http.djDetail({ rid: info.rId });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.djDetails = res.data;
      info.dj = res.data.dj;
    };
    // 电台节目
    const getDjProgram = async () => {
      const { data: res } = await proxy.$http.djProgram({ rid: info.rId });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.program = res.programs;
    };

    onMounted(() => {
      info['rId'] = route.query.id;
      getDjDetail();
      getDjProgram();
    });

    return {
      ...toRefs(info),
    };
  },
};
</script>
<style lang="less" scoped>
.dj-detail {
  background: #f8f8f8;
}
.dj-info {
  display: flex;
  padding: 40px 0;

  .dj-avatar {
    width: 200px;
    height: 200px;
    border-radius: 100%;
    overflow: hidden;

    img {
      width: 100%;
      transition: all 1s;
      &:hover {
        transform: scale(1.1);
      }
    }
  }
  .author {
    display: flex;
    align-content: center;
    padding: 20px 0;
    .author-avatar {
      width: 40px;
      height: 40px;
      img {
        width: 100%;
      }
      .author-name {
        color: #ccc;
      }
    }
    .nick-name {
      padding-left: 10px;
      text-align: center;
      line-height: 40px;
      &:hover {
        color: @color-theme;
      }
    }
  }
  .dj-desc {
    display: flex;
    padding-left: 40px;
    align-content: space-around;
    flex-direction: column;
    .info-name {
      font-size: 20px;
      line-height: 50px;
    }
    .dj-info-count {
      padding: 10px 0;
      span {
        padding-right: 12px;
      }
    }
  }
}
</style>
