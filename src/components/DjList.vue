<template>
  <!-- 歌曲列表 -->
  <div class="dj-list-main">
    <div class="list-header">
      <div class="column-index">序号</div>
      <div class="column-dj">节目名</div>
      <div class="column-number">播放量</div>
      <div class="column-date">日期</div>
      <div class="column-time">时长</div>
    </div>
    <div ref="DjRef">
      <div class="list-main">
        <div class="list-item" v-for="(item, index) in program" :key="item.id">
          <div class="column-index">
            <span>{{ index + 1 }}</span>
          </div>
          <div class="column-dj" @click="currentSong(item.mainSong)">
            <span>{{ item.name }}</span>
          </div>
          <div class="column-number">
            <span>播放{{ $utils.formatNum(item.listenerCount) }}</span>
          </div>
          <div class="column-date">
            <span>{{
              $utils.formatDate(item.scheduledPublishTime, 'yyyy-MM-dd')
            }}</span>
          </div>
          <div class="column-time">
            <span>{{ $utils.formatSongTime(item.duration) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import {
  getCurrentInstance,
  computed,
  nextTick,
  watch,
  onMounted,
  reactive,
  toRefs,
  ref,
} from 'vue';
import { useStore } from 'vuex';
export default {
  name: 'DjList',
  props: {
    program: {
      // 节目列表
      type: Array,
      required: true,
    },
    userId: {
      // 用户id
      type: Number,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const store = useStore();
    const info = reactive({
      playing: false,
      timer: null,
      url: '',
    });

    // 获取播放列表
    const playList = computed(() => store.getters.playList);
    const isPlayed = computed(() => store.getters.isPlayed);
    const playIndex = computed(() => store.getters.playIndex);

    // 获取当前播放音乐信息
    const curSongInfo = computed(() => {
      return playList.value[playIndex.value];
    });

    // 获取音频
    const musicUrl = async (id) => {
      const { data: res } = await proxy.$http.songUrl({
        id: id,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }
      info.url = res.data[0].url;
    };

    // 播放当前曲目
    const currentSong = async (item) => {
      await musicUrl(String(item.id));
      const list = {
        id: String(item.id),
        name: item.name,
        mvId: item.mv,
        singer: item.artists,
        album: item.album,
        alia: item.alia,
        vip: item.fee === 1,
        license: item.license,
        duration: proxy.$utils.formatSongTime(item.duration),
        url: info.url,
        publishTime: proxy.$utils.formatMsgTime(item.publishTime),
        userId: props.userId,
      };
      if (!curSongInfo.value || item.id !== curSongInfo.value.id) {
        store.dispatch('selectPlay', { list: [list] });
      } else {
        store.commit('SET_PLAYSTATUS', !isPlayed.value);
      }
    };

    return {
      ...toRefs(info),
      currentSong,
    };
  },
};
</script>
<style scoped lang="less">
.list-header {
  display: flex;
  line-height: 50px;
  border-bottom: 1px solid #ebeef5;
  font-weight: bold;
  color: #999;
  text-align: center;
}
.list-item {
  display: flex;
  line-height: 50px;
  text-align: center;
}
.column-index {
  flex: 1;
  width: 70px;
  line-height: 50px;
  padding-left: 10px;
}
.column-dj {
  display: flex;
  flex: 1.5;
  padding-right: 10px;
  overflow: hidden;
  align-items: center;
  span:hover {
    color: @color-theme;
    cursor: pointer;
  }
}
.column-number {
  flex: 2;
  padding-right: 10px;
  overflow: hidden;
}
.column-date {
  width: 200px;
}
.column-time {
  width: 140px;
  padding-right: 10px;
  text-align: right;
}
</style>
