<template>
  <div>
    <!-- 歌词，若歌词数组长度为零，有歌显示纯音乐，无则显示歌词加载中，直到数据反应过来 -->
    <div :class="['lyrics-main', lyricName]">
      <div
        class="lyrics"
        ref="lyrics"
        v-if="lyricObj.length"
        :style="transform"
      >
        <p
          :class="[isCurLyric(index)]"
          v-for="(item, index) in lyricObj"
          :key="index"
        >
          {{ item.txt }}
        </p>
      </div>
      <div class="lyric-empty" v-else>
        <p v-if="lyric">纯音乐，无歌词</p>
        <p v-else>歌词加载中......</p>
      </div>
    </div>
    <!-- 如果歌词长度超过6，显示为。。。，如果未显示全部则用。。。表示，通过isFull来判定是否展开 -->
    <div class="lyric-more" v-if="local === 'page' && lyricObj.length > 6">
      <p v-if="!isFull">...</p>
      <span @click.stop="fullLyric">{{ isFull ? '收起' : '展开' }}</span>
    </div>
  </div>
</template>
<script>
import { reactive, toRefs } from 'vue';
import { computed, getCurrentInstance, onMounted, watch } from 'vue';
export default {
  name: 'lyrics',
  props: {
    sId: {
      type: [Number, String],
      default: 0,
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    local: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const info = reactive({
      lyric: null,
      lyricObj: [],
      curIndex: 0,
      isFull: false,
    });
    // 判断是歌曲详情页还是播放条来引用歌词组件，对应各自的样式
    const lyricName = computed(() => {
      return [
        props['local'] === 'page' ? 'page-lyrics' : '',
        info['isFull'] ? 'fullLyrics' : '',
      ];
    });
    // 设置当前的歌词段的样式
    const isCurLyric = computed(() => {
      return (index) => {
        //歌词段正好是当前索引处，且不是在歌词详情内（歌词详情里不做样式变化）
        return index === info['curIndex'] && !props['local'] ? 'active' : '';
      };
    });

    // 歌词实时滚动
    const transform = computed(() => {
      if (info['curIndex'] > 6) {
        return `transform: translateY(-${30 * (info['curIndex'] - 6)}px)`;
      } else {
        return `transform: translateY(0)`;
      }
    });
    // 获取歌词
    const getLyrics = async (id) => {
      const { data: res } = await proxy.$http.lyrics({ id: id });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      // 对歌词进行格式化
      formatLyric(res.lrc);
    };

    // 歌词格式化
    const formatLyric = (lrc) => {
      const lrcReg = /^\[(\d{2}):(\d{2}.\d{2,})\]\s*(.+)$/;

      if (!lrc.lyric) {
        info['lyric'] = true;
        return;
      }
      const lyricLis = lrc.lyric.split('\n');

      info['lyric'] = lrc.lyric;
      lyricLis.forEach((item) => {
        const arr = lrcReg.exec(item);

        if (!arr) {
          return;
        }

        info['lyricObj'].push({ t: arr[1] * 60 * 1 + arr[2] * 1, txt: arr[3] });
      });

      // 根据时间轴重排顺序
      info['lyricObj'].sort((a, b) => {
        return a.t - b.t;
      });
    };

    // 当前歌词所在索引
    const findCurIndex = (t) => {
      for (let i = 0; i < info['lyricObj'].length; i++) {
        if (t <= info['lyricObj'][i].t) {
          return i;
        }
      }
      return info['lyricObj'].length;
    };

    // 页面歌词可以展开查看更多
    const fullLyric = () => {
      info['isFull'] = !info['isFull'];
    };

    // 挂载时立即请求歌词
    onMounted(() => {
      getLyrics(props.sId);
    });

    // 监听传入的sId，方便对歌词的转换
    watch(
      () => props.sId,
      (newVal, oldVal) => {
        info['lyric'] = null;
        info['lyricObj'] = [];
        info['curIndex'] = 0;
        getLyrics(newVal);
      }
    );

    // 监听传入的当前时间
    watch(
      () => props.currentTime,
      (newVal, oldVal) => {
        // 无歌词的时候，不走动画滚动
        if (!info['lyricObj'].length) {
          return;
        }
        info['curIndex'] = findCurIndex(newVal) - 1;
      }
    );
    return {
      ...toRefs(info),
      lyricName,
      isCurLyric,
      transform,
      getLyrics,
      formatLyric,
      findCurIndex,
      fullLyric,
    };
  },
};
</script>
<style scoped lang="less">
.lyrics-main {
  height: 100%;
  max-height: 390px;
  overflow-y: auto;
  transition: all 1.5s ease-in-out;
}

.lyrics {
  font-size: 0;
  transform: translateY(0);
  transition: transform 1.5s ease-in-out;

  :deep(p) {
    margin: 0;
    line-height: 30px;
    font-size: 14px;
    font-weight: 300;

    &.active {
      color: @color-theme;
    }
  }
}
.lyric-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 100px;
  font-size: 14px;
  color: @color-theme;

  ~ .more-lyric {
    display: none;
  }
}
.page-lyrics {
  color: #666;
  overflow: hidden;

  .lyric-empty {
    justify-content: left;
  }

  &.fullLyrics {
    max-height: none;
  }
}

.lyric-more span {
  display: inline-block;
  line-height: 30px;
  cursor: pointer;
  color: @color-theme;
}
</style>
