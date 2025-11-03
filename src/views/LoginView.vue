<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('login')

const loginForm = reactive({
  account: '',
  password: '',
  remember: true
})

const registerForm = reactive({
  phone: '',
  code: '',
  password: '',
  confirmPassword: ''
})

const handleLogin = () => {
  if (!loginForm.account || !loginForm.password) {
    ElMessage.warning('请输入账号和密码')
    return
  }
  ElMessage.success('登录成功')
  router.push('/')
}

const handleRegister = () => {
  if (!registerForm.phone || !registerForm.code || !registerForm.password) {
    ElMessage.warning('请填写完整注册信息')
    return
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }
  ElMessage.success('注册成功，请登录')
  activeTab.value = 'login'
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <div class="brand">
        <h1>Vue优设</h1>
        <p>一站式租住与生活服务平台</p>
      </div>
      <el-tabs v-model="activeTab" stretch class="login-tabs">
        <el-tab-pane label="登录" name="login">
          <el-form label-position="top" class="form">
            <el-form-item label="手机号 / 邮箱">
              <el-input v-model="loginForm.account" placeholder="请输入手机号或邮箱" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="loginForm.password" type="password" show-password />
            </el-form-item>
            <div class="form-extra">
              <el-checkbox v-model="loginForm.remember">记住登录状态</el-checkbox>
              <el-button text type="primary">忘记密码？</el-button>
            </div>
            <el-button type="primary" size="large" block @click="handleLogin">
              立即登录
            </el-button>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="注册" name="register">
          <el-form label-position="top" class="form">
            <el-form-item label="手机号">
              <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="验证码">
              <el-input v-model="registerForm.code" placeholder="短信验证码">
                <template #append>
                  <el-button type="primary" text>获取验证码</el-button>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="设置密码">
              <el-input v-model="registerForm.password" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="registerForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-button type="primary" size="large" block @click="handleRegister">
              注册并登录
            </el-button>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e2a68 0%, #232f6b 40%, #4a64eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 12px;
}

.login-card {
  width: 420px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.35);
  padding: 32px;
}

.brand {
  text-align: center;
  margin-bottom: 18px;
}

.brand h1 {
  margin: 0;
  font-size: 28px;
  color: var(--brand-primary);
}

.brand p {
  margin: 8px 0 0;
  color: var(--gray-3);
}

.login-tabs :deep(.el-tabs__header) {
  margin-bottom: 16px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-extra {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

@media (max-width: 479px) {
  .login-card {
    width: 100%;
    padding: 24px 20px;
  }
}
</style>
