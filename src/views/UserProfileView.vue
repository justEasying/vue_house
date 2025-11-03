<script setup>
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

const profileFormRef = ref()
const profileForm = reactive({
  avatar: 'https://picsum.photos/120?random=5',
  nickname: '张租客',
  gender: 'male',
  birthday: '1995-08-16',
  phone: '13812345678',
  email: 'hello@vueyoushe.com',
  signature: '热爱分享生活的北漂设计师，喜欢音乐与烘焙。',
  password: ''
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
  ElMessage.success('资料已更新')
}

const handleReset = () => {
  profileFormRef.value?.resetFields()
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
            <el-radio-button label="male">男</el-radio-button>
            <el-radio-button label="female">女</el-radio-button>
            <el-radio-button label="secret">保密</el-radio-button>
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
          <el-input v-model="profileForm.signature" type="textarea" rows="3" />
        </el-form-item>
        <el-form-item label="修改密码" prop="password">
          <el-input v-model="profileForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" @click="handleSubmit">保存修改</el-button>
          <el-button size="large" plain @click="handleReset">取消</el-button>
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
