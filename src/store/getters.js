export default {
  // 处于登陆状态或者浏览器本地存储着登陆状态则返回true
  isLogin(state) {
    return state.isLogin || JSON.parse(window.localStorage.getItem('isLogin'));
  },
  // 是否播放过
  isPlayed(state) {
    return state.isPlayed;
  },
  // 登录弹窗显示与隐藏
  loginDialogVisible(state) {
    return state.loginDialogVisible;
  },
  // 返回已有的用户信息，没有则返回空对象
  userInfo(state) {
    return state.userInfo === {}
      ? state.userInfo
      : JSON.parse(window.localStorage.getItem('userInfo')) || {};
  },
  // 返回store里面的或者浏览器本地存储的播放列表值，没有则返回空对象
  playList(state) {
    return state.playList.length
      ? state.playList
      : JSON.parse(window.localStorage.getItem('playList')) || [];
  },
  // 返回store里面或者本地存储的索引值，没有则返回默认值0
  playIndex(state) {
    return (
      state.playIndex ||
      JSON.parse(window.localStorage.getItem('playIndex')) ||
      0
    );
  },
  // 添加及播放成功后，播放列表按钮提示的文字
  isShowPlayListTips(state) {
    return state.isShowPlayListTips;
  },
};
