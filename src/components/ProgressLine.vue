<template>
  <!-- 进度条 线，点，背景-->
  <div class="progress" @click.stop="point" ref="progress">
    <div class="progress-line"></div>
    <div class="progress-bg" :style="{ width: progressWidth }">
      <div class="progress-btn" @mousedown.self.stop="move()"></div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue';
export default {
  name: 'ProgressLine',
  props: ['progressWidth'],
  setup(props, { emit }) {
    const progress = ref(null);
    // 进度条拖拽
    const move = () => {
      document.onmousemove = (e) => {
        setProgressLine(e, false);
      };

      // 拖拽进度条的时候 禁止页面文字选中
      document.body.onselectstart = function () {
        return false;
      };

      document.onmouseup = function (e) {
        // 拖拽结束时候，设置当前音频时间
        setProgressLine(e);
        document.onmousemove =
          document.onmouseup =
          document.body.onselectstart =
            null;
      };

      return false;
    };

    // 点击音频进度条
    const point = (e) => {
      setProgressLine(e);
    };

    const setProgressLine = (e, flag = true) => {
      const $progress = progress.value;
      // 实时获取鼠标横坐标，若超出进度条最大宽度，则值为进度条的宽度
      const curProgress =
        e.clientX - getOffsetLeft($progress) >= $progress.offsetWidth
          ? $progress.offsetWidth
          : e.clientX - getOffsetLeft($progress) <= 0
          ? 0
          : e.clientX - getOffsetLeft($progress);

      emit('setProgressLine', {
        val: curProgress / $progress.offsetWidth,
        flag: flag,
      });
    };

    // 获取元素到浏览器左侧距离
    const getOffsetLeft = (obj) => {
      //元素的左偏移量
      let oLeft = obj.offsetLeft;
      // 距离该子元素最近的进行过定位的父元素
      let oParent = obj.offsetParent;
      // 父元素不为空
      while (oParent !== null) {
        // 元素的做偏移量加上父元素的左偏移量
        oLeft += oParent.offsetLeft;
        // 更新为父元素的·父元素
        oParent = oParent.offsetParent;
      }
      // 返回元素的最终左偏移量
      return oLeft;
    };
    return {
      progress,
      move,
      point,
    };
  },
};
</script>
<style scoped lang="less">
.progress {
  position: relative;
  width: 100%;
  height: 4px;
  padding: 4px 0;
  border-radius: 2px;
  cursor: pointer;

  .progress-line {
    position: absolute;
    top: 4px;
    left: 0;
    width: 100%;
    height: 4px;
    border-radius: 2px;
    background: #eee;
    box-shadow: 0 0 4px #efefef inset;
  }

  .progress-bg {
    position: absolute;
    top: 4px;
    left: 0;
    width: 0;
    height: 4px;
    border-radius: 2px;
    background: -moz-linear-gradient(
      left,
      rgba(@color-theme, 1) 0%,
      rgba(255, 150, 0, 0.77) 10%,
      rgba(@color-theme, 0.8) 50%,
      @color-theme 70%,
      rgba(255, 120, 50, 1) 100%
    ); /* FF3.6-15 */
    background: -webkit-linear-gradient(
      left,
      rgba(@color-theme, 1) 0%,
      rgba(255, 150, 0, 0.77) 10%,
      rgba(@color-theme, 0.8) 50%,
      @color-theme 70%,
      rgba(255, 120, 50, 1) 100%
    ); /* Chrome10-25,Safari5.1-6 */
    background: linear-gradient(
      to right,
      rgba(@color-theme, 1) 0%,
      rgba(255, 150, 0, 0.77) 10%,
      rgba(@color-theme, 0.8) 50%,
      @color-theme 70%,
      rgba(255, 120, 50, 1) 100%
    ); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#ff7832',GradientType=1 ); /* IE6-9 */
  }

  .progress-btn {
    position: absolute;
    right: -6px;
    width: 4px;
    height: 4px;
    border: 4px solid @color-theme;
    top: -4.5px;
    background: #fff;
    box-shadow: 0 0 15px 0 rgba(0, 0, 0, 0.15);
    transition: all 0.3s;
    border-radius: 50%;
    cursor: grab;
  }
}
</style>
