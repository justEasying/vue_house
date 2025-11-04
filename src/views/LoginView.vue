<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import {
  ArrowLeft,
  CircleCheck,
  User,
  Lock,
  Message,
  Phone,
  Key
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 登录/注册模式切换
const isLogin = ref(true)

// 登录方式：phone-手机号验证码，account-账号密码
const loginType = ref('phone')

// 表单引用
const phoneFormRef = ref(null)
const codeFormRef = ref(null)
const accountFormRef = ref(null)
const registerFormRef = ref(null)

// 登录表单数据
const loginForm = ref({
  phoneNumber: '',
  verificationCode: '',
  username: '',
  password: ''
})

// 注册表单数据
const registerForm = ref({
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  verificationCode: ''
})

// 步骤：1-手机号输入，2-验证码输入（仅用于手机号登录）
const step = ref(1)
const agreed = ref(false)
const registerAgreed = ref(false)
const rememberMe = ref(false)

// 倒计时
const countdown = ref(0)
const registerCountdown = ref(0)
let countdownTimer = null
let registerCountdownTimer = null

// 手机号验证
const phoneValid = computed(() => {
  return /^1[3-9]\d{9}$/.test(loginForm.value.phoneNumber)
})

const registerPhoneValid = computed(() => {
  return /^1[3-9]\d{9}$/.test(registerForm.value.phoneNumber)
})

// 登录表单验证规则
const phoneLoginRules = {
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^[0-9]{6}$/, message: '验证码必须为6位数字', trigger: 'blur' }
  ]
}

const accountLoginRules = {
  username: [
    { required: true, message: '请输入用户名或邮箱', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.value.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const validateAgreed = (rule, value, callback) => {
  if (!registerAgreed.value) {
    callback(new Error('请先同意用户协议和隐私政策'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
      message: '用户名只能包含字母、数字、下划线和中文',
      trigger: 'blur'
    }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' }
  ],
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
    {
      pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
      message: '密码必须包含字母和数字',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { pattern: /^[0-9]{6}$/, message: '验证码必须为6位数字', trigger: 'blur' }
  ],
  agreed: [{ validator: validateAgreed, trigger: 'change' }]
}

// 切换登录/注册模式
const switchMode = (mode) => {
  isLogin.value = mode
  // 重置表单和状态
  if (mode) {
    // 切换到登录模式
    step.value = 1
    loginForm.value = {
      phoneNumber: '',
      verificationCode: '',
      username: '',
      password: ''
    }
    agreed.value = false
    rememberMe.value = false
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    countdown.value = 0
  } else {
    // 切换到注册模式
    registerForm.value = {
      username: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      verificationCode: ''
    }
    registerAgreed.value = false
    if (registerCountdownTimer) {
      clearInterval(registerCountdownTimer)
      registerCountdownTimer = null
    }
    registerCountdown.value = 0
  }
}

// 监听登录方式切换，重置表单
watch(loginType, () => {
  if (loginType.value === 'phone') {
    step.value = 1
    loginForm.value.verificationCode = ''
  } else {
    loginForm.value.username = ''
    loginForm.value.password = ''
  }
})

// 处理手机号输入
const handlePhoneInput = () => {
  loginForm.value.phoneNumber = loginForm.value.phoneNumber.replace(/\D/g, '')
}

// 处理注册手机号输入
const handleRegisterPhoneInput = () => {
  registerForm.value.phoneNumber = registerForm.value.phoneNumber.replace(/\D/g, '')
}

// 处理验证码输入
const handleCodeInput = () => {
  loginForm.value.verificationCode = loginForm.value.verificationCode.replace(/\D/g, '')
}

// 处理注册验证码输入
const handleRegisterCodeInput = () => {
  registerForm.value.verificationCode = registerForm.value.verificationCode.replace(/\D/g, '')
}

// 获取验证码（登录）
const handleGetCode = async () => {
  if (!phoneFormRef.value) return

  try {
    await phoneFormRef.value.validate()
  } catch (error) {
    return
  }

  if (!agreed.value) {
    ElMessage.warning('请先同意用户协议和隐私政策')
    return
  }

  // 开始倒计时
  countdown.value = 60
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
  }, 1000)

  // 切换到验证码输入步骤
  step.value = 2

  // 这里可以调用API发送验证码
  ElMessage.success('验证码已发送')
  console.log('发送验证码到:', loginForm.value.phoneNumber)
}

// 获取验证码（注册）
const handleGetRegisterCode = async () => {
  if (!registerFormRef.value) return

  // 验证手机号
  try {
    await registerFormRef.value.validateField('phoneNumber')
  } catch (error) {
    return
  }

  if (!registerPhoneValid.value) {
    ElMessage.warning('请输入正确的手机号')
    return
  }

  // 开始倒计时
  registerCountdown.value = 60
  if (registerCountdownTimer) {
    clearInterval(registerCountdownTimer)
  }
  registerCountdownTimer = setInterval(() => {
    registerCountdown.value--
    if (registerCountdown.value <= 0) {
      clearInterval(registerCountdownTimer)
      registerCountdownTimer = null
    }
  }, 1000)

  // 这里可以调用API发送验证码
  ElMessage.success('验证码已发送')
  console.log('发送注册验证码到:', registerForm.value.phoneNumber)
}

// 重新获取验证码
const handleResend = () => {
  handleGetCode()
}

// 确认登录（手机号验证码）
const handleConfirm = async () => {
  if (!codeFormRef.value) return

  try {
    await codeFormRef.value.validate()
  } catch (error) {
    return
  }

  // 这里可以调用API验证验证码并登录
  console.log('登录信息:', {
    phoneNumber: loginForm.value.phoneNumber,
    verificationCode: loginForm.value.verificationCode
  })

  // 模拟用户数据（实际项目中从API返回）
  const userData = {
    name: '用户' + loginForm.value.phoneNumber.slice(-4),
    uid: 'UID' + Date.now().toString().slice(-6),
    phone: loginForm.value.phoneNumber,
    avatar: 'https://picsum.photos/120?random=' + Math.floor(Math.random() * 100),
    tags: ['新用户'],
    stats: [
      { label: '想看房源', value: 0 },
      { label: '约看记录', value: 0 },
      { label: '服务预约', value: 0 },
      { label: '社区活动', value: 0 }
    ]
  }
  
  // 模拟 token（实际项目中从API返回）
  const token = 'token_' + Date.now()

  // 存储用户信息到 store 和 localStorage
  userStore.login(userData, token)

  ElMessage.success('登录成功')

  // 跳转到我的页面
  setTimeout(() => {
    router.push('/my')
  }, 500)
}

// 账号密码登录
const handleAccountLogin = async () => {
  if (!accountFormRef.value) return

  try {
    await accountFormRef.value.validate()
  } catch (error) {
    return
  }

  // 这里可以调用API登录
  console.log('登录信息:', {
    username: loginForm.value.username,
    password: loginForm.value.password,
    rememberMe: rememberMe.value
  })

  // 模拟用户数据（实际项目中从API返回）
  const userData = {
    name: loginForm.value.username,
    uid: 'UID' + Date.now().toString().slice(-6),
    username: loginForm.value.username,
    avatar: 'https://picsum.photos/120?random=' + Math.floor(Math.random() * 100),
    tags: ['优设会员'],
    stats: [
      { label: '想看房源', value: 5 },
      { label: '约看记录', value: 2 },
      { label: '服务预约', value: 3 },
      { label: '社区活动', value: 1 }
    ]
  }
  
  // 模拟 token（实际项目中从API返回）
  const token = 'token_' + Date.now()

  // 存储用户信息到 store 和 localStorage
  userStore.login(userData, token)

  ElMessage.success('登录成功')

  // 跳转到我的页面
  setTimeout(() => {
    router.push('/my')
  }, 500)
}

// 注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
  } catch (error) {
    return
  }

  if (!registerAgreed.value) {
    ElMessage.warning('请先同意用户协议和隐私政策')
    return
  }

  // 这里可以调用API注册
  console.log('注册信息:', registerForm.value)

  // 模拟用户数据（实际项目中从API返回）
  const userData = {
    name: registerForm.value.username,
    uid: 'UID' + Date.now().toString().slice(-6),
    username: registerForm.value.username,
    email: registerForm.value.email,
    phone: registerForm.value.phoneNumber,
    avatar: 'https://picsum.photos/120?random=' + Math.floor(Math.random() * 100),
    tags: ['新用户'],
    stats: [
      { label: '想看房源', value: 0 },
      { label: '约看记录', value: 0 },
      { label: '服务预约', value: 0 },
      { label: '社区活动', value: 0 }
    ]
  }
  
  // 模拟 token（实际项目中从API返回）
  const token = 'token_' + Date.now()

  // 注册成功后直接登录
  userStore.register(userData, token)

  ElMessage.success('注册成功')

  // 跳转到我的页面
  setTimeout(() => {
    router.push('/my')
  }, 1000)
}

// 返回
const handleBack = () => {
  if (isLogin.value && loginType.value === 'phone' && step.value === 2) {
    // 如果在验证码步骤，返回手机号输入步骤
    step.value = 1
    loginForm.value.verificationCode = ''
    if (countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
    }
    countdown.value = 0
    if (codeFormRef.value) {
      codeFormRef.value.clearValidate()
    }
  } else {
    // 返回上一页
    router.back()
  }
}

// 忘记密码
const handleForgotPassword = () => {
  ElMessage.info('忘记密码功能开发中')
}

// 用户协议
const handleAgreement = () => {
  console.log('查看用户协议')
  // 这里可以跳转到用户协议页面
}

// 隐私政策
const handlePrivacy = () => {
  console.log('查看隐私政策')
  // 这里可以跳转到隐私政策页面
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <!-- 返回按钮 -->
      <el-button
        class="back-btn"
        :icon="ArrowLeft"
        circle
        text
        @click="handleBack"
      />

      <!-- 品牌标识 -->
      <div class="brand">
        <h1>Vue优设</h1>
        <p>一站式租住与生活服务平台</p>
      </div>

      <!-- 登录/注册切换标签 -->
      <div class="tab-container">
        <div class="tab-wrapper">
          <div
            class="tab-item"
            :class="{ active: isLogin }"
            @click="switchMode(true)"
          >
            登录
          </div>
          <div
            class="tab-item"
            :class="{ active: !isLogin }"
            @click="switchMode(false)"
          >
            注册
          </div>
        </div>
      </div>

      <!-- 登录内容区域 -->
      <div class="login-content">
        <!-- 登录模式 -->
        <div v-if="isLogin" class="step-content">
          <!-- 登录方式切换 -->
          <div class="login-type-tabs">
            <el-radio-group v-model="loginType" size="small">
              <el-radio-button value="phone">手机号登录</el-radio-button>
              <el-radio-button value="account">账号登录</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 手机号验证码登录 -->
          <div v-if="loginType === 'phone'">
            <!-- 第一步：手机号输入 -->
            <div v-if="step === 1">
              <el-form
                ref="phoneFormRef"
                :model="loginForm"
                class="login-form"
                :rules="phoneLoginRules"
              >
                <el-form-item prop="phoneNumber">
                  <el-input
                    v-model="loginForm.phoneNumber"
                    type="tel"
                    placeholder="请输入手机号"
                    maxlength="11"
                    size="large"
                    class="custom-input"
                    @input="handlePhoneInput"
                  >
                    <template #prefix>
                      <el-icon><Phone /></el-icon>
                    </template>
                    <template #suffix>
                      <el-icon v-if="phoneValid" class="success-icon">
                        <CircleCheck />
                      </el-icon>
                    </template>
                  </el-input>
                </el-form-item>

                <!-- 用户协议 -->
                <el-form-item>
                  <el-checkbox v-model="agreed" class="agreement-checkbox">
                    <span class="agreement-text">
                      同意
                      <el-link
                        type="primary"
                        :underline="false"
                        @click="handleAgreement"
                      >
                        《用户协议》
                      </el-link>
                      和
                      <el-link
                        type="primary"
                        :underline="false"
                        @click="handlePrivacy"
                      >
                        《隐私政策》
                      </el-link>
                    </span>
                  </el-checkbox>
                </el-form-item>

                <!-- 获取验证码按钮 -->
                <el-form-item>
                  <el-button
                    class="get-code-btn"
                    type="primary"
                    size="large"
                    :disabled="!phoneValid || !agreed"
                    @click="handleGetCode"
                  >
                    获取验证码
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 第二步：验证码输入 -->
            <div v-if="step === 2">
              <el-form
                ref="codeFormRef"
                :model="loginForm"
                class="login-form"
                :rules="phoneLoginRules"
              >
                <el-form-item prop="verificationCode">
                  <el-input
                    v-model="loginForm.verificationCode"
                    type="text"
                    placeholder="请输入验证码"
                    maxlength="6"
                    size="large"
                    class="custom-input"
                    @input="handleCodeInput"
                  >
                    <template #prefix>
                      <el-icon><Key /></el-icon>
                    </template>
                    <template #suffix>
                      <div v-if="countdown > 0" class="countdown">
                        {{ countdown }}s
                      </div>
                      <el-button
                        v-else
                        class="resend-btn"
                        text
                        type="primary"
                        @click="handleResend"
                      >
                        重新获取
                      </el-button>
                    </template>
                  </el-input>
                </el-form-item>

                <!-- 确认按钮 -->
                <el-form-item>
                  <el-button
                    class="confirm-btn"
                    type="primary"
                    size="large"
                    :disabled="loginForm.verificationCode.length !== 6"
                    @click="handleConfirm"
                  >
                    确认登录
                  </el-button>
                </el-form-item>
              </el-form>
            </div>
          </div>

          <!-- 账号密码登录 -->
          <div v-if="loginType === 'account'">
            <el-form
              ref="accountFormRef"
              :model="loginForm"
              class="login-form"
              :rules="accountLoginRules"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  type="text"
                  placeholder="请输入用户名或邮箱"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  class="custom-input"
                  show-password
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item>
                <div class="login-options">
                  <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                  <el-link
                    type="primary"
                    :underline="false"
                    @click="handleForgotPassword"
                  >
                    忘记密码？
                  </el-link>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button
                  class="login-btn"
                  type="primary"
                  size="large"
                  @click="handleAccountLogin"
                >
                  登录
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>

        <!-- 注册模式 -->
        <div v-if="!isLogin" class="step-content">
          <el-form
            ref="registerFormRef"
            :model="registerForm"
            class="login-form"
            :rules="registerRules"
          >
            <el-form-item prop="username">
              <el-input
                v-model="registerForm.username"
                type="text"
                placeholder="请输入用户名（3-20个字符）"
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <el-icon><User /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="email">
              <el-input
                v-model="registerForm.email"
                type="email"
                placeholder="请输入邮箱地址"
                size="large"
                class="custom-input"
              >
                <template #prefix>
                  <el-icon><Message /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="phoneNumber">
              <el-input
                v-model="registerForm.phoneNumber"
                type="tel"
                placeholder="请输入手机号"
                maxlength="11"
                size="large"
                class="custom-input"
                @input="handleRegisterPhoneInput"
              >
                <template #prefix>
                  <el-icon><Phone /></el-icon>
                </template>
                <template #suffix>
                  <el-icon v-if="registerPhoneValid" class="success-icon">
                    <CircleCheck />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model="registerForm.password"
                type="password"
                placeholder="请输入密码（至少8位，包含字母和数字）"
                size="large"
                class="custom-input"
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                placeholder="请再次输入密码"
                size="large"
                class="custom-input"
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item prop="verificationCode">
              <el-input
                v-model="registerForm.verificationCode"
                type="text"
                placeholder="请输入手机验证码"
                maxlength="6"
                size="large"
                class="custom-input"
                @input="handleRegisterCodeInput"
              >
                <template #prefix>
                  <el-icon><Key /></el-icon>
                </template>
                <template #suffix>
                  <el-button
                    class="get-code-btn-inline"
                    text
                    type="primary"
                    :disabled="!registerPhoneValid || registerCountdown > 0"
                    @click="handleGetRegisterCode"
                  >
                    {{
                      registerCountdown > 0
                        ? `${registerCountdown}s`
                        : '获取验证码'
                    }}
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <!-- 用户协议 -->
            <el-form-item prop="agreed">
              <el-checkbox v-model="registerAgreed" class="agreement-checkbox">
                <span class="agreement-text">
                  我已阅读并同意
                  <el-link
                    type="primary"
                    :underline="false"
                    @click="handleAgreement"
                  >
                    《用户协议》
                  </el-link>
                  和
                  <el-link
                    type="primary"
                    :underline="false"
                    @click="handlePrivacy"
                  >
                    《隐私政策》
                  </el-link>
                </span>
              </el-checkbox>
            </el-form-item>

            <!-- 注册按钮 -->
            <el-form-item>
              <el-button
                class="register-btn"
                type="primary"
                size="large"
                @click="handleRegister"
              >
                注册
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
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
  padding: var(--spacing-2xl) var(--spacing-md);
  position: relative;
}

.login-card {
  width: 480px;
  max-width: 100%;
  background: var(--color-white);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-2xl);
  padding: var(--spacing-3xl);
  position: relative;
}

.back-btn {
  position: absolute;
  top: var(--spacing-lg);
  left: var(--spacing-lg);
  font-size: var(--font-size-xl);
  color: var(--gray-2);
  transition: var(--transition-fast);
}

.back-btn:hover {
  color: var(--brand-primary);
}

.brand {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  margin-top: var(--spacing-md);
}

.brand h1 {
  margin: 0;
  font-size: var(--font-size-5xl);
  color: var(--brand-primary);
  font-weight: var(--font-weight-bold);
}

.brand p {
  margin: var(--spacing-sm) 0 0;
  color: var(--gray-3);
  font-size: var(--font-size-sm);
}

/* 登录/注册切换标签 */
.tab-container {
  margin-bottom: var(--spacing-xl);
}

.tab-wrapper {
  display: flex;
  gap: var(--spacing-md);
  border-bottom: 2px solid var(--border-color);
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: var(--spacing-md) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--gray-3);
  cursor: pointer;
  position: relative;
  transition: var(--transition-base);
}

.tab-item:hover {
  color: var(--brand-primary);
}

.tab-item.active {
  color: var(--brand-primary);
  font-weight: var(--font-weight-semibold);
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--brand-primary);
}

.login-content {
  width: 100%;
}

.step-content {
  width: 100%;
}

/* 登录方式切换 */
.login-type-tabs {
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: center;
}

.login-type-tabs :deep(.el-radio-group) {
  width: 100%;
}

.login-type-tabs :deep(.el-radio-button) {
  flex: 1;
}

.login-type-tabs :deep(.el-radio-button__inner) {
  width: 100%;
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-sm);
  border-color: var(--border-color);
  transition: var(--transition-fast);
}

.login-type-tabs :deep(.el-radio-button__inner:hover) {
  color: var(--brand-primary);
}

.login-type-tabs :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.login-type-tabs :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  border-left: none;
}

.login-type-tabs
  :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background-color: var(--brand-primary);
  border-color: var(--brand-primary);
  color: var(--color-white);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.login-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.custom-input {
  width: 100%;
}

.custom-input :deep(.el-input__wrapper) {
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
  transition: var(--transition-fast);
}

.custom-input :deep(.el-input__wrapper:hover) {
  border-color: var(--brand-primary);
}

.custom-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px var(--brand-primary-soft);
  border-color: var(--brand-primary);
}

.custom-input :deep(.el-input__prefix) {
  color: var(--gray-3);
  margin-right: var(--spacing-sm);
}

.custom-input :deep(.el-input__suffix) {
  color: var(--gray-3);
}

.success-icon {
  color: var(--brand-success);
  font-size: var(--font-size-xl);
}

.agreement-checkbox {
  width: 100%;
}

.agreement-checkbox :deep(.el-checkbox__label) {
  font-size: var(--font-size-sm);
  color: var(--gray-3);
  line-height: var(--line-height-normal);
}

.agreement-text {
  font-size: var(--font-size-sm);
  color: var(--gray-3);
}

.agreement-text .el-link {
  font-size: var(--font-size-sm);
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-options :deep(.el-checkbox__label) {
  font-size: var(--font-size-sm);
  color: var(--gray-3);
}

.get-code-btn,
.confirm-btn,
.login-btn,
.register-btn {
  width: 100%;
  height: 48px;
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-top: var(--spacing-md);
}

.get-code-btn-inline {
  padding: 0 var(--spacing-sm);
  font-size: var(--font-size-sm);
  background: transparent !important;
  color: var(--brand-primary) !important;
}

.get-code-btn-inline:hover {
  background: transparent !important;
  opacity: 0.8;
}

.get-code-btn-inline:disabled,
.get-code-btn-inline.is-disabled {
  background: transparent !important;
  color: var(--brand-primary) !important;
  opacity: 0.6;
}

.countdown {
  font-size: var(--font-size-sm);
  color: var(--brand-primary);
  font-weight: var(--font-weight-medium);
  padding: 0 var(--spacing-sm);
}

.resend-btn {
  padding: 0 var(--spacing-sm);
  font-size: var(--font-size-sm);
}

@media (max-width: 767px) {
  .login-card {
    width: 100%;
    padding: var(--spacing-xl) var(--spacing-lg);
  }

  .brand h1 {
    font-size: var(--font-size-4xl);
  }
}
</style>
