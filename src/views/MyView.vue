<script setup>
import { computed, onMounted, ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'
import { ElMessageBox, ElMessage } from 'element-plus'
import { wantList, appointmentList } from '@/utils/storage'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

// 实时统计数据
const stats = computed(() => {
  // 从 localStorage 获取想看房源数量
  const wantCount = wantList.getList().length
  
  // 从 localStorage 获取约看记录数量
  const appointmentCount = appointmentList.getList().length
  
  // 从 order store 获取服务订单数量（排除已取消的）
  // 添加防御性检查，确保 orders 是数组
  const orders = Array.isArray(orderStore.orders) ? orderStore.orders : []
  const serviceCount = orders.filter(order => 
    order.status !== 'cancelled'
  ).length
  
  // 社区活动暂时固定为 0（未实现）
  const activityCount = 0
  
  return [
    { label: '想看房源', value: wantCount },
    { label: '约看记录', value: appointmentCount },
    { label: '服务预约', value: serviceCount },
    { label: '社区活动', value: activityCount }
  ]
})

// 从 store 获取登录状态和用户信息
const isLogin = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => {
  const defaultInfo = {
    name: '游客',
    uid: '未登录',
    avatar: 'https://picsum.photos/120?random=6',
    tags: []
  }
  
  return userStore.userInfo || defaultInfo
})

// 强制刷新标记（用于触发视图更新）
const refreshKey = ref(0)

// 页面加载时，从 localStorage 恢复用户信息
onMounted(() => {
  userStore.restoreFromStorage()
  // orderStore 数据会通过 Pinia persist 插件自动恢复
  
  // 每隔一段时间刷新一次统计数据（可选）
  const refreshInterval = setInterval(() => {
    refreshKey.value++
  }, 5000) // 每5秒刷新一次
  
  // 组件卸载时清除定时器
  onBeforeUnmount(() => {
    clearInterval(refreshInterval)
  })
})

const entryList = [
  { title: '我的想看', icon: 'StarFilled', desc: '收藏房源管理', link: '/my/want' },
  { title: '我的足迹', icon: 'View', desc: '浏览历史记录', link: '/my/footprint' },
  { title: '我的约看', icon: 'Calendar', desc: '预约看房管理', link: '/my/appointment' },
  { title: '我的拼租', icon: 'Connection', desc: '拼租信息管理', link: '/my/share' },
  { title: '个人资料', icon: 'User', desc: '修改头像昵称', link: '/my/profile' },
  { title: '服务订单', icon: 'Tickets', desc: '保洁搬家订单', link: '/orders' }
]

const goTo = (link) => {
  // 如果未登录，跳转到登录页
  if (!isLogin.value) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push(link)
}

// 跳转到登录页
const handleLogin = () => {
  router.push('/login')
}

// 跳转到注册页
const handleRegister = () => {
  router.push('/login')
}
// 退出登录
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出登录',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 清除用户信息和 localStorage
    userStore.logout()
    
    ElMessage.success('已退出登录')
    
    // 跳转到登录页
    router.push('/login')
  } catch {
    // 用户取消
  }
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>我的</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>个人中心 · 管理我的租住生活</h2>
      </div>
      <el-tag v-if="isLogin" type="success" size="large">
        已登录
      </el-tag>
      <el-tag v-else type="info" size="large">
        未登录
      </el-tag>
    </div>

    <div v-if="isLogin" class="section-card">
      <div class="user-info">
        <div class="user-info__profile">
          <el-avatar :size="88" :src="userInfo.avatar" />
          <div class="profile-text">
            <h3>{{ userInfo.name }}</h3>
            <p>{{ userInfo.uid }}</p>
            <div class="tag-group">
              <el-tag v-for="tag in userInfo.tags" :key="tag" type="success" effect="plain">
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
        
      </div>
      <div class="user-stats" :key="refreshKey">
        <div v-for="item in stats" :key="item.label" class="stat-item">
          <strong>{{ item.value }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </div>
    </div>

    <div v-if="isLogin" class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">功能入口</span>
        <el-text type="info">快速进入我的收藏、足迹、约看、拼租等管理页面</el-text>
      </div>
      <div class="entry-grid">
        <div
          v-for="item in entryList"
          :key="item.title"
          class="entry-card"
          @click="goTo(item.link)"
        >
          <div class="entry-icon">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div class="entry-text">
            <h4>{{ item.title }}</h4>
            <p>{{ item.desc }}</p>
          </div>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <div v-if="!isLogin" class="section-card login-card">
      <div class="login-card__content">
        <el-icon><Unlock /></el-icon>
        <h3>您尚未登录</h3>
        <p>登录后即可查看收藏房源、预约记录、拼租信息等个性化内容。</p>
        <div class="login-card__actions">
          <el-button type="primary" size="large" @click="handleLogin">立即登录</el-button>
          <el-button size="large" plain @click="handleRegister">注册账号</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.user-info__profile {
  display: flex;
  align-items: center;
  gap: 16px;
}

.profile-text h3 {
  margin: 0;
  font-size: 22px;
  color: var(--gray-1);
}

.profile-text p {
  margin: 4px 0;
  font-size: 14px;
  color: var(--gray-4);
}

.tag-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.user-info__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  background: rgba(47, 84, 235, 0.08);
  border-radius: var(--border-radius-md);
  padding: 20px 24px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  color: var(--gray-3);
}

.stat-item strong {
  font-size: 26px;
  color: var(--brand-primary);
}

.entry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.entry-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: var(--border-radius-md);
  background: rgba(47, 84, 235, 0.08);
  cursor: pointer;
  transition: var(--transition-base);
}

.entry-card:hover {
  transform: translateY(-4px);
  background: rgba(47, 84, 235, 0.12);
}

.entry-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  background: rgba(47, 84, 235, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--brand-primary);
  font-size: 24px;
}

.entry-text h4 {
  margin: 0;
  font-size: 16px;
  color: var(--gray-1);
}

.entry-text p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--gray-3);
}

.login-card {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card__content {
  text-align: center;
  padding: 48px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.login-card__content :deep(.el-icon) {
  font-size: 46px;
  color: var(--brand-primary);
}

.login-card__content h3 {
  margin: 0;
  font-size: 22px;
  color: var(--gray-1);
}

.login-card__content p {
  margin: 0;
  color: var(--gray-3);
  max-width: 360px;
}

.login-card__actions {
  display: flex;
  gap: 16px;
}

@media (max-width: 767px) {
  .user-info__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .login-card__actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
