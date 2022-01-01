import * as types from './mutation-types';

export default {
  // 设置登陆状态
  [types.SET_LOGIN](state, val = false) {
    state.isLogin = val;
  },
  // 记录登录用户信息
  setUserInfo(state, val) {
    state.userInfo = val;
  },
  // 设置登录弹窗显示与隐藏
  setLoginDialog(state, val) {
    state.loginDialogVisible = val;
  },
  // 设置播放状态，默认不播放
  [types.SET_PLAYSTATUS](state, val = false) {
    state.isPlayed = val;
  },
  // 往播放列表里面添加，同时往浏览器本地存储该值
  [types.SET_PLAYLIST](state, val = null) {
    state.playList = val;
    window.localStorage.setItem('playList', JSON.stringify(val));
  },
  // 更新播放歌曲在列表的所在位置，同时在浏览器本地存储该索引值
  [types.SET_PLAYINDEX](state, val = 0) {
    state.playIndex = val;
    window.localStorage.setItem('playIndex', val);
  },
  // 显示播放列表按钮提示的文字
  [types.SET_PLAYLISTTIPS](state, val = false) {
    state.isShowPlayListTips = val;
  },
};
