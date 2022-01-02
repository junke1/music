<template>
  <!-- 歌曲列表 -->
  <div class="songs-list-main">
    <div class="list-header flex">
      <div class="column-index">序号</div>
      <div class="column-song">歌曲</div>
      <div class="column-singer">歌手</div>
      <div class="column-album" v-if="typeSize !== 'mini'">专辑</div>
      <div class="column-time" v-if="typeSize !== 'recent'">时长</div>
      <div class="column-time" v-if="typeSize === 'recent'">最新播放时间</div>
    </div>
    <div
      class="list-scroll"
      :style="{ height: height + 'px' }"
      ref="curSongRef"
    >
      <div class="list-main" :style="curSongSty">
        <div
          :class="isCurSong(item, index)"
          v-for="(item, index) in list"
          :key="item.id"
        >
          <div class="column-index">
            <span class="songlist-index">{{ indexMethod(index) }}</span>
            <!-- 点击播放后的播放图标 -->
            <div class="audio-icon">
              <div class="column" style="animation-delay: -1.2s"></div>
              <div class="column"></div>
              <div class="column" style="animation-delay: -1.5s"></div>
              <div class="column" style="animation-delay: -0.9s"></div>
              <div class="column" style="animation-delay: -0.6s"></div>
            </div>
            <i :class="playIcon(item)" @click="currentSong(item)"></i>
          </div>
          <div class="column-song songlist-name">
            <!-- 歌名 -->
            <router-link
              :class="typeSize"
              :to="{ path: '/song', query: { id: item.id } }"
              >{{ item.name }}
            </router-link>
            <!-- mv -->
            <template v-if="typeSize !== 'mini' || typeSize !== 'recent'">
              <router-link
                :to="{ path: '/mv', query: { id: item.mvId } }"
                class="mv-name"
                v-if="item.mvId"
              >
                <i class="iconfont icon-video"></i>
              </router-link>
              <i class="iconfont icon-vip" v-if="item.vip"></i>
            </template>
          </div>

          <div class="column-singer songlist-singer">
            <!-- 返回的数据里用户的uid有可能为0 -->
            <!-- 歌手 -->
            <div v-if="item.singer[0].id !== 0">
              <router-link
                :to="{ path: '/singer', query: { id: author.id } }"
                class="song-name"
                v-for="(author, k) in item.singer"
                :key="author.name"
              >
                {{ k !== 0 ? ' / ' + author.name : author.name }}
              </router-link>
            </div>
            <div v-else>
              <router-link
                :to="{ path: '/user', query: { id: item.userId } }"
                class="song-name"
              >
                {{ item.singer[0].name }}
              </router-link>
            </div>
          </div>
          <!-- 专辑 -->
          <div class="column-album" v-if="typeSize !== 'mini'">
            <router-link
              class="songlist-album"
              :to="{ path: '/album', query: { id: item.album.id } }"
              v-if="item.album"
            >
              {{ item.album.name }}
            </router-link>
          </div>
          <!-- 时长 -->
          <div class="column-time">
            <div class="songlist-time" v-if="typeSize !== 'recent'">
              {{ item.duration }}
            </div>
            <div class="songlist-time" v-else>
              {{ item.playTime }}
            </div>
            <!-- 添加进列表 -->
            <div class="songlist-oper">
              <i
                class="iconfont icon-add"
                title="添加到列表"
                v-if="typeSize !== 'mini'"
                @click="addSongList(item)"
              ></i>

              <!-- 如果是播放条里的歌单，显示删除按钮 -->
              <i
                class="iconfont icon-del"
                title="删除"
                v-if="typeSize === 'mini'"
                @click.stop="delList(index)"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 分页 -->
    <div class="pagination" v-if="isShowPagination">
      <el-pagination
        @current-change="currentChange"
        :page-size="pageSize"
        :current-page="currentPage"
        layout="prev, pager, next"
        :total="songList.length"
        v-if="display"
        class="pag"
      ></el-pagination>
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
  name: 'SongList',
  props: {
    songList: {
      // 歌曲列表
      type: Array,
      required: true,
    },
    typeSize: {
      // 播放列表展示类型，默认normal是歌单下的展示列表，
      // mini是播放条下的歌曲列表的
      type: String,
      default: 'normal',
    },
    stripe: {
      // 隔行变色
      type: Boolean,
      default: false,
    },
    height: {
      type: [Number, String],
      default: 'auto',
    },
    // 分页加载 || 无限滚动加载
    isScroll: {
      type: Boolean,
      default: false,
    },
    offset: {
      // 若是列表有分页，偏移数量
      type: Number,
      default: 0,
    },
    display: {
      // 默认有分页功能
      type: Number,
      default: 1,
    },
  },
  setup(props) {
    const { proxy } = getCurrentInstance();
    const curSongRef = ref(null);
    const store = useStore();
    const info = reactive({
      typeSize: props.typeSize,
      height: props.height,
      curScroll: -1 || 1,
      pageSize: 20,
      currentPage: 1,
      playing: false,
      timer: null,
    });

    // 获取播放列表
    const playList = computed(() => store.getters.playList);
    const isPlayed = computed(() => store.getters.isPlayed);
    const playIndex = computed(() => store.getters.playIndex);

    // 获取当前播放音乐信息
    const curSongInfo = computed(() => {
      return playList.value[playIndex.value];
    });

    onMounted(() => {
      scrollCurSong(curSongInfo);
    });

    // 获取音频
    const musicUrl = async (id, item) => {
      const { data: res } = await proxy.$http.songUrl({
        id: id,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      if (res.data[0].code !== 404) {
        item.url = res.data[0].url;
      }
    };

    // 播放当前播放歌曲
    const currentSong = async (item) => {
      await musicUrl(String(item.id), item);
      // 若当前无歌曲或者 当前播放歌曲不是本歌单显示的歌曲，立即播放当前歌单
      if (!curSongInfo.value || item.id !== curSongInfo.value.id) {
        store.dispatch('selectPlay', { list: [item] });
      } else {
        store.commit('SET_PLAYSTATUS', !isPlayed.value);
      }
    };

    // 获取歌曲列表
    const list = computed(() => {
      if (!props.isScroll && props.typeSize !== 'recent') {
        return props.songList.slice(
          (info.currentPage - 1) * info.pageSize,
          info.currentPage * info.pageSize
        );
      } else {
        return props.songList;
      }
    });
    // 向上滚动
    const curSongSty = computed(() => {
      return `transform: translateY(${info.curScroll}px)`;
    });

    // 表格列表序号格式化
    const indexMethod = (page) => {
      if (!props.isScroll) {
        return (info.currentPage - 1) * info.pageSize + page + 1 + props.offset;
      } else {
        return page + 1;
      }
    };

    // 列表样式
    const isCurSong = computed(() => {
      return (item, index) => {
        return [
          'list-item',
          props.stripe ? (index % 2 === 0 ? 'stripe' : '') : '',
          isPlayed.value &&
          item.id &&
          curSongInfo.value &&
          item.id === curSongInfo.value.id
            ? 'active'
            : '',
          item.license || item.vip ? 'disable' : '',
          item.vip ? 'vip' : '',
        ];
      };
    });

    // 序号及播放状态
    const playIcon = computed(() => {
      return (item) => {
        return [
          'iconfont',
          'playicon',
          isPlayed.value &&
          item.id &&
          curSongInfo.value &&
          item.id === curSongInfo.value.id
            ? 'icon-pause'
            : 'icon-play',
        ];
      };
    });

    // 添加当前歌曲到播放列表
    const addSongList = (item) => {
      store.dispatch('addList', { list: [item] });
      store.commit('SET_PLAYLISTTIPS', true);
    };

    //在播放列表删除当前歌曲
    const delList = (index) => {
      if (playList.value.length > 1) {
        playList.value.splice(index, 1);
        store.commit('SET_PLAYLIST', playList.value);

        if (playIndex.value >= playList.value.length) {
          store.commit('SET_PLAYINDEX', playList.value.length - 1);
        }
      } else {
        store.commit('SET_PLAYSTATUS', false);
        store.commit('SET_PLAYLIST', []);
      }
    };

    // 滚动到当前播放音乐的位置
    const scrollCurSong = (cur) => {
      if (props.isScroll) {
        const curIndex = props.songList.findIndex((item) => {
          return item.id === cur.id;
        });

        if (curIndex > 7 && curIndex < props.songList.length - 8) {
          info.curScroll = -(curIndex - 4) * 50;
        } else if (
          curIndex >= props.songList.length - 8 &&
          props.songList.length - 8 > 0
        ) {
          info.curScroll = -(props.songList.length - 8) * 50;
        } else {
          info.curScroll = 0;
        }
        // 滚动监听
        const $curSongRef = curSongRef.value;
        $curSongRef.addEventListener(
          'wheel',
          (event) => {
            if (event.wheelDelta > 0 || event.detail < 0) {
              info.curScroll =
                Math.abs(info.curScroll) > 0 ? info.curScroll + 50 : 0;
            } else {
              info.curScroll =
                Math.abs(info.curScroll) <
                ((props.songList.length - 8) / 2) * 100
                  ? info.curScroll - 50
                  : info.curScroll;
            }
          },
          { passive: true }
        );
      }
    };

    // 分页显示
    const isShowPagination = computed(() => {
      return props.songList.length > info.pageSize && !props.isScroll;
    });

    // 歌曲列表分页功能
    const currentChange = (page) => {
      info.currentPage = page;
    };

    watch(
      curSongInfo,
      (val) => {
        // 添加歌曲的时候，props的歌曲列表没有更新
        nextTick(() => {
          val && scrollCurSong(val);
        });
      },
      { deep: true }
    );

    watch(
      () => {
        return props.songList;
      },
      () => {
        return (info.currentPage = 1);
      }
    );
    return {
      ...toRefs(info),
      list,
      curSongRef,
      curSongSty,
      currentSong,
      indexMethod,
      isCurSong,
      playIcon,
      curSongInfo,
      addSongList,
      delList,
      currentChange,
      isShowPagination,
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
}
.column-index {
  width: 70px;
  line-height: 50px;
  padding-left: 10px;
}
.column-song {
  display: flex;
  flex: 1.5;
  padding-right: 10px;
  overflow: hidden;
  align-items: center;
}
.column-singer {
  flex: 2;
  padding-right: 10px;
  overflow: hidden;
}
.column-album {
  width: 200px;
}
.column-time {
  width: 140px;
  padding-right: 10px;
  text-align: right;
}
.audio-icon {
  display: none;
  width: 20px;
  height: 18px;
  margin: 16px 2px;
  overflow: hidden;

  .column {
    width: 2px;
    height: 100%;
    margin-left: 2px;
    background-color: @color-theme;
    -webkit-animation: play 0.9s linear infinite alternate;
    animation: play 0.9s linear infinite alternate;
  }
}
.list-scroll {
  -moz-user-select: none; /*火狐*/
  -webkit-user-select: none; /*webkit浏览器*/
  -ms-user-select: none; /*IE10*/
  -khtml-user-select: none; /*早期浏览器*/
  user-select: none;
  overflow-y: hidden;
}
.list-main {
  transition: transform 0.3s;
}
.list-item {
  display: flex;
  line-height: 0;

  .iconfont {
    margin-left: 10px;
    font-size: 22px;
    cursor: pointer;

    &:hover {
      color: @color-theme;
    }
  }

  .songlist-index {
    display: inline-block;
    width: 24px;
    text-align: center;
  }

  .playicon {
    display: none;
    margin-left: 0;
  }

  .songlist-name {
    a {
      display: inline-block;
      max-width: 60%;
      line-height: 50px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      vertical-align: top;
    }

    .mini {
      max-width: 100%;
    }

    i:hover {
      color: @color-theme;
      cursor: pointer;
    }
  }

  .songlist-singer,
  .songlist-album {
    display: inline-block;
    max-width: 100%;
    line-height: 50px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .songlist-time {
    line-height: 50px;
    padding-right: 10px;
  }

  .songlist-oper {
    display: none;
    line-height: 50px;
  }

  &.stripe {
    background: #fafafa;
  }

  &.active {
    background: #f0f0f0;

    .songlist-index,
    .playicon {
      display: none;
    }

    .audio-icon {
      display: flex;
    }

    &:hover {
      .playicon {
        display: block;
        color: @color-theme;
      }
      .audio-icon {
        display: none;
      }
    }
  }

  &:hover {
    background: #f0f0f0;

    .songlist-time,
    .songlist-index {
      display: none;
    }

    .songlist-oper,
    .playicon {
      display: block;
    }
  }

  .icon-vip {
    font-size: 30px;
    color: @color-theme;
  }

  &.disable {
    color: #ccc;

    a {
      color: #ccc;
    }

    .playicon,
    .songlist-oper {
      display: none;
    }

    .songlist-index,
    .songlist-time {
      display: block;
    }
  }

  &.vip {
    color: @color-theme;

    a {
      color: @color-theme;
    }
  }
}

.song-list {
  .songlist-singer {
    display: inline-block;
    width: 100px;
    height: 23px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .songlist-name {
    width: 210px;

    a {
      display: inline-block;
      max-width: 185px;
      height: 23px;
      margin-right: 5px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    i:hover {
      color: @color-theme;
      cursor: pointer;
    }
  }

  .songlist-album {
    display: inline-block;
    width: 95%;
    height: 23px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .songlist-oper {
    display: none;

    .iconfont {
      margin-left: 15px;
      font-size: 22px;
      cursor: pointer;

      &:hover {
        color: @color-theme;
      }
    }
  }
}
.pagination {
  padding: 50px 0 0;
  text-align: center;
  display: flex;
  justify-content: center;
  :deep(.pag) {
    display: flex;
    justify-content: space-between;
    font-weight: bold;
    ul li {
      list-style: none;
      display: inline-block;
      margin: 0 20px;
    }
    li.active,
    li:hover {
      color: #49a1ff;
      text-align: none;
      background: white;
      border: #ddd;
      cursor: pointer;
    }
    button {
      padding: 0;
      margin: 0;
      list-style: none;
      border: none;
      background: white;
      display: inline-block;
    }
    button.disabled {
      color: #868e96;
    }
  }
}

@-webkit-keyframes play {
  0% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }

  to {
    -webkit-transform: translateY(75%);
    transform: translateY(75%);
  }
}

@keyframes play {
  0% {
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }

  to {
    -webkit-transform: translateY(75%);
    transform: translateY(75%);
  }
}
</style>
