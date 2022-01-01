import * as types from './mutation-types';
import utils from '@/utils/util';

// 合并歌曲到播放列表查重
const concatPlayList = (list, playList = []) => {
  // filter过滤无版权及vip歌曲
  return utils.concatPlayList(
    list.filter((item) => {
      // 不符合返回空数组
      return !item.license && !item.vip;
    }),
    playList
  );
};

// 当前歌曲在播放列表的索引
const findIndex = (list, playList) => {
  const index = playList.findIndex((d) => {
    return d.id === list.id;
  });
  return index;
};

export default {
  //登录
  loginSuc(context, val) {
    context.commit('setLoginDialog', val);
  },
  //每次播放或者添加歌曲都是将新值与旧值过滤掉vip的无版权的重复的
  // 然后再重组成一个新的值再赋值给store里面的playlist

  // 播放歌曲列表里全部歌曲（清空当前播放列表）
  playAll({ commit }, { list }) {
    commit(types.SET_PLAYLIST, concatPlayList(list));
    commit(types.SET_PLAYSTATUS, true);
    commit(types.SET_PLAYINDEX, 0);
  },

  //播放当前选中的歌曲
  selectPlay({ commit, state }, { list }) {
    const playList = concatPlayList(list, state.playList);

    commit(types.SET_PLAYLIST, playList);
    commit(types.SET_PLAYSTATUS, true);
    commit(types.SET_PLAYINDEX, findIndex(list[0], playList));
  },

  // 添加歌曲到当前播放列表
  addList({ commit, state }, { list }) {
    const playList = concatPlayList(list, state.playList);
    // 仅添加就不用设置播放状态和提交索引值了
    commit(types.SET_PLAYLIST, playList);
  },
};
