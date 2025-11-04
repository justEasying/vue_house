<script setup>
import { reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()
const profileFormRef = ref()

// 初始化表单数据
const profileForm = reactive({
  avatar: '',
  nickname: '',
  gender: 'secret',
  birthday: '',
  phone: '',
  email: '',
  signature: '',
  password: ''
})

// 页面加载时从 store 读取用户信息
onMounted(() => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 从 store 中读取用户信息并填充表单
  const user = userStore.userInfo
  if (user) {
    profileForm.avatar = user.avatar || 'https://picsum.photos/120?random=5'
    profileForm.nickname = user.name || user.username || ''
    profileForm.gender = user.gender || 'secret'
    profileForm.birthday = user.birthday || ''
    profileForm.phone = user.phone || ''
    profileForm.email = user.email || ''
    profileForm.signature = user.signature || ''
    profileForm.password = ''
  }
})

const rules = {
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1\d{10}$/, message: '手机号格式不正确', trigger: ['blur', 'change'] }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] }
  ],
  password: [{ min: 6, message: '密码至少 6 位', trigger: 'blur' }]
}

const handleAvatarChange = (uploadFile) => {
  const reader = new FileReader()
  reader.onload = () => {
    profileForm.avatar = reader.result
  }
  reader.readAsDataURL(uploadFile.raw)
}

const handleSubmit = async () => {
  const valid = await profileFormRef.value?.validate().catch(() => false)
  if (!valid) return
  
  // 准备更新的数据
  const updates = {
    avatar: profileForm.avatar,
    name: profileForm.nickname,
    username: profileForm.nickname,
    gender: profileForm.gender,
    birthday: profileForm.birthday,
    phone: profileForm.phone,
    email: profileForm.email,
    signature: profileForm.signature
  }
  
  // 如果填写了新密码，添加到更新数据中
  if (profileForm.password) {
    updates.password = profileForm.password
    console.log('密码已更新（实际项目中应该调用 API 修改密码）')
  }
  
  // 更新 store 中的用户信息（同时会更新 localStorage）
  userStore.updateUserInfo(updates)
  
  // 清空密码字段
  profileForm.password = ''
  
  ElMessage.success('资料已更新')
  
  // 可选：延迟跳转回个人中心
  setTimeout(() => {
    router.push('/my')
  }, 1000)
}

const handleReset = () => {
  // 重新从 store 加载用户信息
  const user = userStore.userInfo
  if (user) {
    profileForm.avatar = user.avatar || 'https://picsum.photos/120?random=5'
    profileForm.nickname = user.name || user.username || ''
    profileForm.gender = user.gender || 'secret'
    profileForm.birthday = user.birthday || ''
    profileForm.phone = user.phone || ''
    profileForm.email = user.email || ''
    profileForm.signature = user.signature || ''
    profileForm.password = ''
  }
  
  // 清除表单验证状态
  profileFormRef.value?.clearValidate()
  
  ElMessage.info('已重置表单')
}

const goBack= () => {
  router.push('/my')
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item to="/my">我的</el-breadcrumb-item>
          <el-breadcrumb-item>个人资料</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>完善个人资料</h2>
      </div>
      <el-button type="primary" plain @click="handleReset">重置</el-button>
    </div>

    <div class="section-card">
      <el-form
        ref="profileFormRef"
        :model="profileForm"
        :rules="rules"
        label-width="120px"
        class="profile-form"
      >
        <el-form-item label="头像">
          <div class="avatar-uploader">
            <el-avatar :size="104" :src="profileForm.avatar" />
            <el-upload
              class="upload"
              action="#"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/png,image/jpeg"
              @change="handleAvatarChange"
            >
              <el-button type="primary" plain>更换头像</el-button>
            </el-upload>
          </div>
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="profileForm.nickname" />
        </el-form-item>
        <el-form-item label="性别">
          <el-radio-group v-model="profileForm.gender">
            <el-radio-button value="male">男</el-radio-button>
            <el-radio-button value="female">女</el-radio-button>
            <el-radio-button value="secret">保密</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="生日">
          <el-date-picker
            v-model="profileForm.birthday"
            type="date"
            placeholder="选择日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="profileForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="profileForm.email" />
        </el-form-item>
        <el-form-item label="个性签名">
          <el-input v-model="profileForm.signature" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="修改密码" prop="password">
          <el-input v-model="profileForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="handleSubmit">保存修改</el-button>
          <el-button size="large" plain @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-form {
  max-width: 720px;
}

.avatar-uploader {
  display: flex;
  align-items: center;
  gap: 16px;
}

.upload :deep(.el-upload) {
  display: inline-flex;
}

@media (max-width: 767px) {
  .profile-form {
    max-width: 100%;
  }

  .avatar-uploader {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
