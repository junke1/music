<template>
  <el-container class="container">
    <el-header :height="backBottom + 'px'">
      <Header />
    </el-header>
    <el-main>
      <div class="layout">
        <router-view></router-view>
      </div>
      <div class="back">
        <el-backtop target=".el-main">
          <img src="./assets/goTop.png" alt="" />
        </el-backtop>
      </div>
      <PlayBar class="under" />
      <Footer />
    </el-main>
    <div class="login">
      <Login v-show="loginDialogVisible" />
    </div>
  </el-container>
</template>

<script>
import Header from '@components/Header.vue';
import Footer from '@components/Footer.vue';
import Login from '@components/Login.vue';
import PlayBar from './components/PlayBar.vue';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
export default {
  setup(props) {
    const store = useStore();
    const loginDialogVisible = computed(() => store.getters.loginDialogVisible);
    const backBottom = ref(80);

    return {
      loginDialogVisible,
      backBottom,
    };
  },
  components: {
    Header,
    Footer,
    Login,
    PlayBar,
  },
};
</script>

<style scoped>
.container {
  height: 100%;
  position: relative;
}
.under {
  bottom: 0;
}
.el-main {
  height: 100%;
  overflow: auto;
  position: relative;
}
/* .back {
  position: fixed;
  bottom: 80px;
  right: 40px;
  cursor: pointer;
} */
.layout {
  /* header80px 和40px footer - 70px playbar -10px*/
  min-height: calc(100% - 40px);
}
.login {
  display: flex;
  justify-content: center;
}
</style>
