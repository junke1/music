export default {
  // 数字过万的处理
  formatNum(val) {
    let num = 0;
    if (val > 9999) {
      num = Math.round((val / 10000) * 10) / 10 + '万';
    } else {
      num = val;
    }
    return num;
  },

  // 时间毫秒格式化处理 2021-12-6 01：09：11
  formatDate(originVal, fmt) {
    const dt = new Date(originVal);
    const opt = {
      yyyy: dt.getFullYear(),
      MM: (dt.getMonth() + 1 + '').padStart(2, '0'),
      dd: (dt.getDate() + 1 + '').padStart(2, '0'),
      HH: (dt.getHours() + 1 + '').padStart(2, '0'),
      mm: (dt.getMinutes() + 1 + '').padStart(2, '0'),
      ss: (dt.getSeconds() + 1 + '').padStart(2, '0'),
    };

    for (const k in opt) {
      const ret = new RegExp('(' + k + ')').exec(fmt);
      if (ret) {
        fmt = fmt.replace(ret[1], opt[k]);
      }
    }

    return fmt;
  },

  // 歌曲毫秒格式化处理 03：30
  formatSongTime(duration = 0) {
    duration = duration / 1000;
    const m = (Math.floor(duration / 60) + '').padStart(2, '0');
    const s = (Math.floor(duration % 60) + '').padStart(2, '0');
    return `${m}:${s}`;
  },

  // 评论时间格式化处理
  formatMsgTime(duration) {
    let result = '';
    const NOW = new Date();
    const PAST = new Date(duration);

    // 判断是当天的时间 显示格式 10：20
    if (NOW.toDateString() === PAST.toDateString()) {
      result = this.formatDate(duration, 'HH:mm');
      // 时间为当年 显示月日 时间戳
    } else if (PAST.getFullYear() === NOW.getFullYear()) {
      result = this.formatDate(duration, 'MM月dd日 HH:mm');
    } else {
      result = this.formatDate(duration, 'yyyy年MM月dd日');
    }

    return result;
  },

  // 添加歌曲到播放列表，过滤重复的歌曲
  concatPlayList(newList = [], oldList = []) {
    const arr = [...oldList, ...newList];
    const map = new Map();

    for (const item of arr) {
      if (!map.has(item.id)) {
        map.set(item.id, item);
      }
    }

    return [...map.values()];
  },
};
