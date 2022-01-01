<template>
  <div class="header">
    <div class="w1200">
      <el-row class="wrapper">
        <!-- 页面logo -->
        <el-col :span="4">
          <router-link to="/" class="logo"
            ><img src="@assets/music_logo.png" alt=""
          /></router-link>
        </el-col>
        <!-- 菜单 -->
        <el-col :span="12">
          <ul class="nav">
            <li
              :class="{ 'is-active': menuActive == item.path }"
              v-for="item in menuList"
              :key="item.path"
              @click="selectMenu(item.path)"
            >
              <span>{{ item.name }}</span>
            </li>
          </ul>
        </el-col>
        <!-- 搜索框 -->
        <el-col :span="6">
          <div class="search">
            <div @click="search">
              <el-popover placement="bottom" :width="200" trigger="click">
                <!-- 获取焦点事件，输入事件，键盘enter按下事件，提供clearable清空输入框 -->
                <template #reference>
                  <el-input
                    class="key-val"
                    placeholder="请输入歌名、歌词、歌手或专辑"
                    v-model="keyVal"
                    @focus="handleFocus"
                    @input="handleInput"
                    @keydown.enter="search"
                    clearable
                  >
                  </el-input>
                </template>
                <!-- 没有关键词时默认弹出热门搜索的数据 -->
                <div class="hot-search" v-if="!keyVal">
                  <h5>热门搜索</h5>
                  <div class="hot-search-list">
                    <div
                      class="hot-item"
                      v-for="(item, index) in serachHot"
                      :key="index"
                      @click="jumpSearch(item)"
                    >
                      <!-- ：class判断前三的设置对应的样式 -->
                      <span :class="[index < 3 ? 'top-' + index : '']">{{
                        index + 1 + '.'
                      }}</span>
                      {{ item.first }}
                    </div>
                  </div>
                </div>
                <!-- 有关键词时 -->
                <div class="search-key-list" v-else-if="keyVal">
                  <div
                    class="search-item"
                    v-for="(item, index) in suggestInfo.order"
                    :key="index"
                  >
                    <h6>{{ keyVal }} - {{ type(item) }}</h6>
                    <div class="item-main">
                      <div
                        class="list"
                        v-for="(val, k) in suggestInfo[item]"
                        :key="k"
                        @click="jumpPage(val, item)"
                      >
                        {{ val.name }}
                        <template v-if="item === 'songs'">
                          -<span v-for="(a, i) in val.artists" :key="i">{{
                            (i !== 0 ? ' / ' : '') + a.name
                          }}</span>
                        </template>
                        <template v-else-if="item === 'albums'">
                          -<span>{{ val.artist.name }}</span>
                        </template>
                      </div>
                    </div>
                  </div>
                </div>
              </el-popover>
              <i class="iconfont icon-search"></i>
            </div>
          </div>
        </el-col>
        <!-- 登录状态 -->
        <el-col :span="2" :class="isLogin ? 'user-avatar' : 'login'">
          <div class="logined" v-if="isLogin">
            <!-- 点击菜单项后会触发事件，用户可以通过相应的菜单项command_ key 进行不同的操作 -->
            <el-dropdown placement="bottom" @command="userMenuHandler">
              <img :src="userInfo.avatarUrl" class="avatar" />

              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="user">
                    <i class="iconfont icon-home"></i>我的主页
                  </el-dropdown-item>
                  <el-dropdown-item command="quit"
                    ><i class="iconfont icon-quit"></i>退出
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <!-- 未登录状态，点击进行登录 -->
          <span class="login-btn" @click="loginDialog" v-else>登录</span>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script>
import { computed, getCurrentInstance, reactive, toRefs } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

export default {
  setup() {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    const menuList = reactive([
      {
        name: '首页',
        path: '/index',
      },
      {
        name: '排行榜',
        path: '/rank',
      },
      {
        name: '歌单',
        path: '/playlist',
      },
      {
        name: 'MV',
        path: '/mvlist',
      },
      {
        name: '歌手',
        path: '/artist',
      },
      // {
      //   name: '我的音乐',
      //   path: '/my',
      // },
    ]);
    const route = useRoute();
    const router = useRouter();
    const info = reactive({
      keyVal: '',
      serachHot: [],
      suggestInfo: {},
      isShowSearch: false,
    });

    // 切换导航跳转
    const selectMenu = (item) => {
      if (isLogin.value || item.indexOf('/my') < 0) {
        router.push({
          path: item,
        });
      } else {
        loginDialog();
      }
    };
    // 当前选择菜单
    const menuActive = computed(() => route.path);
    // 是否显示登录弹窗
    const loginDialog = () => store.commit('setLoginDialog', true);
    // 登录成功后，获取用户信息
    const isLogin = computed(() => store.getters.isLogin);
    const userInfo = computed(() => store.getters.userInfo);

    // 头像下来菜单，点击跳转
    const userMenuHandler = (type) => {
      switch (type) {
        case 'user':
          router.push({
            path: 'user',
            query: { id: store.getters.userInfo.userId },
          });
          break;
        // case 'grade':
        //   router.push({
        //     name: 'grade',
        //   });
        //   break;
        // case 'set':
        //   router.push({
        //     name: 'setting',
        //   });
        //   break;
        case 'quit':
          logout();
          break;
      }
    };
    // 判断item的类型，转译为中文
    const type = (item) => {
      switch (item) {
        case 'songs':
          return '歌曲';
        case 'artists':
          return '歌手';
        case 'albums':
          return '专辑';
        case 'playlists':
          return '歌单';
      }
    };
    // 退出登陆状态
    const logout = async () => {
      const { data: res } = await proxy.$http.logout();

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      proxy.$msg.success('退出成功');
      // 将浏览器本地存储的与登录相关的数据移除
      window.localStorage.removeItem('token');
      window.localStorage.removeItem('cookie');
      window.localStorage.removeItem('userInfo');
      window.localStorage.removeItem('isLogin');
      // 提交commit请求，将用户信息设置为空，以及将登录状态设置为false
      store.commit('setUserInfo', {});
      store.commit('SET_LOGIN', false);
      // 假如退出登录前处于我的主页，则返回首页
      if (route.path.indexOf('/my') >= 0) {
        router.push({ path: '/' });
      }
    };
    // 热门搜索，将请求的热门歌曲数据赋值给searchhot
    const getSearchHot = async () => {
      const { data: res } = await proxy.$http.serachHot();

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.serachHot = res.result.hots;
    };
    // 搜索关键词请求获得数据
    const getSerachSuggest = async () => {
      const { data: res } = await proxy.$http.searchSuggest({
        keywords: info.keyVal,
      });

      if (res.code !== 200) {
        return proxy.$msg.error('数据请求失败');
      }

      info.suggestInfo = res.result;
    };

    // 默认热门搜索列表，点击后台跳转到搜索结果页面
    const jumpSearch = (item) => {
      info.isShowSearch = false;
      info.keyVal = item.first;
      if (item.first === route.query.key) {
        return;
      }
      router.push({ path: '/search', query: { key: item.first } });
    };

    const search = () => {
      // 点击搜索关键词，跳转到搜索结果页面
      if (info.keyVal) {
        router.push({ path: '/search', query: { key: info.keyVal } });
        info.isShowSearch = false;
      }
    };

    // 搜索列表，点击列表中选项后跳转到相对应的落地页
    const jumpPage = (item, type) => {
      info.keyVal = item.name;
      switch (type) {
        case 'songs':
          router.push({ path: '/song', query: { id: item.id } });
          break;
        case 'artists':
          router.push({ path: '/singer', query: { id: item.id } });
          break;
        case 'albums':
          router.push({ path: '/album', query: { id: item.id } });
          break;
        case 'playlists':
          router.push({ path: '/playlist/detail', query: { id: item.id } });
          break;
      }
      info.isShowSearch = false;
    };

    const showSearch = () => {
      // 显示搜索列表 若有关键词显示搜索建议，否则显示默认热门搜索列表
      if (!info.keyVal) {
        // 把原先的热门数据清空，再重新发起请求获取数据来赋值
        info.serachHot = [];
        getSearchHot();
      } else {
        info.suggestInfo = {};
        getSerachSuggest();
      }
    };

    // 关键词输入响应，有则进行显示列表，顺便将显示状态设置为true
    const handleInput = () => {
      if (info.keyVal) {
        showSearch();
        info.isShowSearch = true;
      } else {
        info.isShowSearch = false;
      }
    };

    // 获取焦点时显示列表
    const handleFocus = () => {
      showSearch();
      info.isShowSearch = true;
    };

    // 离开关闭列表
    const handleClose = () => {
      info.isShowSearch = false;
    };

    return {
      ...toRefs(info),
      menuList,
      menuActive,
      selectMenu,
      loginDialog,
      userInfo,
      isLogin,
      userMenuHandler,
      jumpSearch,
      jumpPage,
      handleInput,
      handleFocus,
      handleClose,
      search,
      type,
    };
  },
};
</script>
<style lang="less" scoped>
.header {
  position: relative;
  z-index: 2;
  font-size: 0;
  box-shadow: 0 2px 10px 0 rgba(52, 52, 52, 0.1);
  background: #fff;
}
.wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.logo {
  display: inline-block;
  height: 60px;
  line-height: 60px;
  padding: 10px 0;
  img {
    height: 60px;
  }
}
.nav {
  border: 0;
  font-size: 0;

  li {
    display: inline-block;
    padding: 0;
    height: 78px;
    line-height: 80px;
    color: #909399;
    cursor: pointer;
    border-bottom: 2px solid transparent;
  }

  .is-active {
    border-bottom: 2px solid @color-theme;
    color: #303133;
  }

  span {
    padding: 0 20px;
    display: block;
    font-size: 14px;
    text-decoration: none;
  }
}

.search {
  display: flex;
  justify-content: space-between;

  .key-val {
    width: 226px;
    line-height: 32px;
    border: 0;
    border-bottom: 1px solid #999;

    :deep(input) {
      padding: 0;
      width: 100%;
      border: none;
    }
  }

  .icon-search {
    font-size: 20px;
    padding-left: 20px;
    line-height: 40px;
    cursor: pointer;
  }
}
.hot-search {
  border-radius: 6px;
  padding: 10px 0 0 10px;
  h5 {
    font-size: 18px;
  }

  .hot-search-list {
    padding: 10px 0;
  }
  .hot-item {
    line-height: 28px;
    cursor: pointer;

    .top-0 {
      font-weight: bold;
      color: rgba(255, 0, 0, 1);
    }

    .top-1 {
      font-weight: bold;
      color: rgba(255, 0, 0, 0.6);
    }

    .top-2 {
      font-weight: bold;
      color: rgba(255, 0, 0, 0.4);
    }

    img {
      display: inline-block;
      width: auto;
      height: 16px;
      padding: 6px 0;
      vertical-align: top;
    }
  }
}
:deep(.el-input__suffix) {
  width: 100%;
  i {
    position: relative;
    top: 15px;
    left: 230px;
  }
}
.search-key-list {
  .search-item {
    border-top: solid 1px #7c7a7a59;
    margin: -1px -12px 0;
    background: white;

    h6 {
      font-size: 14px;
      line-height: 36px;
      color: #666;
      padding: 0 12px;
      text-align: center;
    }

    .list {
      line-height: 36px;
      color: #999;
      padding: 0 12px 0 40px;
      display: block;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      cursor: pointer;

      &:hover {
        color: #fff;
        background: @color-theme;
      }
    }

    &:first-child {
      border: 0;
    }
  }
}

.user-avatar {
  text-align: center;

  .avatar {
    display: inline-block;
    width: 40px;
    height: 40px;
    border-radius: 100%;
    overflow: hidden;
    cursor: pointer;
  }
  .el-dropdown {
    padding: 20px 0;
    font-size: 0;
  }
}
.login {
  text-align: center;

  .login-btn {
    font-size: 16px;
    cursor: pointer;
  }
}
</style>
