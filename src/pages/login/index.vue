<template>
  <el-row class="wrapper">
    <el-col :span="6" :offset="9">
      <h3 class="welcome">欢迎使用</h3>
      <el-form class="app-form" ref="form" label-position="top" :model="form" :rules="rules">
        <el-form-item label="请输入用户名" prop="username">
          <el-input v-model="form.username" placeholder="用户名"></el-input>
        </el-form-item>
        <el-form-item label="请输入密码" prop="password">
          <el-input type="password" v-model="form.password" placeholder="密码" @keyup.enter.native="doLogin"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 100%" @click.stop="doLogin" :loading="loginBtnState">登 录</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<script>
import { login } from '@/api/blogAdmin';
import { setToken, setUser } from '@/assets/js/auth';
import router from '@/router/index.js';

export default {
  name: 'Login',
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        username: [{ required: true, message: '请输入用户名.', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码.', trigger: 'blur' },
          { min: 3, max: 6, message: '长度在 3 到 6 个字符', trigger: 'blur' }
        ]
      },
      loginBtnState: false
    };
  },
  methods: {
    // 登录
    doLogin() {
      let that = this;
      that.loginBtnState = true;
      let param = {
        phone: that.form.username,
        password: that.form.password
      };
      login(param).then(res => {
        setToken(res.data.jwt);
        setUser(res.data.username);
        router.push({ path: '/' });
      });
    }
  }
};
</script>
