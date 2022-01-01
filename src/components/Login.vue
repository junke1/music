<template>
  <div class="login">
    <!-- 登陆组件，默认显示dialog组件，宽度占30%，关闭前执行相应的方法 -->
    <el-dialog v-model="isVisible" width="30%" :before-close="handleClose">
      <div class="login-wrapper">
        <img src="@assets/music_logo.png" alt="" class="login-logo" />
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginFormRules"
          label-width=""
        >
          <el-form-item prop="phone" label-width="">
            <el-input
              v-model="loginForm.phone"
              placeholder="请输入网易云帐号登录"
              prefix-icon="iconfont icon-phone"
            ></el-input>
          </el-form-item>
          <el-form-item prop="pwd" label-width="">
            <!-- show-password密码化，设置键盘enter事件进行信息提交登录 -->
            <el-input
              v-model="loginForm.pwd"
              placeholder="请输入密码"
              show-password
              prefix-icon="iconfont icon-pwd"
              @keydown.enter="submitForm"
            ></el-input>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <!-- 点击后进行信息提交登录 -->
          <el-button type="primary" @click="submitForm">登录</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import {
  computed,
  getCurrentInstance,
  reactive,
  ref,
  toRefs,
} from '@vue/runtime-core';
import { useStore } from 'vuex';
export default {
  name: 'Login',
  setup() {
    const store = useStore();
    const { proxy } = getCurrentInstance();
    // 设置默认值，无修改
    const isVisible = ref(true);
    // 对store提交commit请求，表明取消登录
    const handleClose = () => store.commit('setLoginDialog', false);

    // 存放输入响应式的账号和密码
    const formInfo = reactive({
      loginForm: {
        phone: '',
        pwd: '',
      },
      // 通过 rules 属性传入约定的验证规则，并将 form-Item 的 prop 属性设置为需 form 绑定值对应的字段名
      loginFormRules: {
        phone: [{ required: true, message: '请输入网易帐号', trigger: 'blur' }],
        pwd: [{ required: true, message: '请输入网易密码', trigger: 'blur' }],
      },
    });
    // 提交登录信息
    const submitForm = () => {
      // validate是element，form的的方法，对整个表单进行验证
      // 参数是回调函数，验证后会包含布尔值和一个对象
      proxy.$refs.loginFormRef.validate(async (valid) => {
        if (valid) {
          const { data: res } = await proxy.$http.login(formInfo['loginForm']);

          if (res.code !== 200) {
            proxy.$msg.error(res.msg);
          } else {
            // 通过请求返回的用户id来获取用户信息，并且在浏览器本地存储请求返回的token和cookie值，
            // 并像store提交commit请求关闭登录窗口
            getUserInfo(res.profile.userId);
            window.localStorage.setItem('token', res.token);
            window.localStorage.setItem('cookie', res.cookie);
            store.commit('setLoginDialog', false);
          }
        }
      });
    };
    // 通过用户的id来请求对应的用户信息，并存储到浏览器本地。并向store提交登录成功信息以及用户的个人信息
    const getUserInfo = async (uid) => {
      const { data: res } = await proxy.$http.getUserInfo({ uid: uid });
      console.log(res);
      if (res.code !== 200) {
        proxy.$msg.error(res.msg);
      } else {
        window.localStorage.setItem('isLogin', true);
        window.localStorage.setItem('userInfo', JSON.stringify(res.profile));
        store.commit('SET_LOGIN', true);
        store.commit('setUserInfo', res.profile);
      }
    };

    return {
      handleClose,
      isVisible,
      ...toRefs(formInfo),
      submitForm,
    };
  },
};
</script>
<style scoped lang="less">
.login-logo {
  display: block;
  margin: 0 auto 50px;
}
.login {
  :deep(.el-dialog__body) {
    padding: 30px 20px 0;
  }
  :deep(.el-input__suffix-inner) {
    margin-top: 14px;
  }
  .dialog-footer {
    position: relative;
    z-index: 2;
    display: block;
    width: 100%;
    margin-bottom: 120px;

    .el-button {
      width: 100%;
      color: #ccc;
    }
  }

  :deep(.el-dialog__footer) {
    position: relative;

    &:after {
      display: block;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 1;
      content: '';
      width: 100%;
      height: 100%;
      opacity: 0.3;
      background: url('@assets/login_bg2.jpg') center bottom no-repeat;
      background-size: contain;
    }
  }
}
</style>
