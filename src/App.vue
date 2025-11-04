<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import allCitiesData from './data/cities.json'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920)
const drawerVisible = ref(false)
const city = ref('北京')
const searchKeyword = ref('')

// 热门城市（默认显示）
const hotCities = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '重庆',
  '苏州',
  '南京',
  '武汉',
  '西安',
  '天津'
]

// 所有城市数据
const allCities = ref([...allCitiesData])
// 当前显示的城市列表（默认显示热门城市，搜索时显示匹配结果）
const cityOptions = ref([...hotCities])

const menuItems = [
  {
    path: '/',
    label: '首页',
    icon: 'House'
  },
  {
    path: '/want',
    label: '想看',
    icon: 'Guide'
  },
  {
    path: '/service',
    label: '服务',
    icon: 'Suitcase'
  },
  {
    path: '/discover',
    label: '发现',
    icon: 'Compass'
  }
]

const notifications = ref([
  {
    id: 1,
    title: '【活动】周末社区音乐会报名开启，席位有限！',
    time: '10分钟前'
  },
  {
    id: 2,
    title: '【房源推荐】为你匹配3套通勤30分钟内的精装房。',
    time: '1小时前'
  },
  {
    id: 3,
    title: '【服务提醒】"深度保洁"预约将在明日09:00开始。',
    time: '昨天'
  }
])

const unreadCount = computed(() => notifications.value.length)
const showLayout = computed(() => route.meta?.layout !== 'blank')
const isMobile = computed(() => viewportWidth.value < 1024)
const activeMenu = computed(() => route.meta?.activeMenu ?? route.path)

const handleResize = () => {
  viewportWidth.value = window.innerWidth
  if (isMobile.value) {
    drawerVisible.value = false
  }
}

// 城市搜索函数
const handleCitySearch = (query) => {
  const queryStr = (query || '').trim()
  if (!queryStr) {
    // 无搜索内容时，显示热门城市
    cityOptions.value = [...hotCities]
    return
  }
  // 搜索匹配的城市（支持中文和拼音首字母）
  const queryLower = queryStr.toLowerCase()
  const filtered = allCities.value.filter((cityName) => {
    const cityLower = cityName.toLowerCase()
    return cityLower.includes(queryLower) || cityName.includes(queryStr)
  })
  // 限制搜索结果最多显示 50 个，避免列表过长
  cityOptions.value = filtered.slice(0, 50)
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})

watch(
  () => route.path,
  () => {
    if (isMobile.value) {
      drawerVisible.value = false
    }
  }
)

const handleMenuSelect = (path) => {
  if (path === route.path) return
  router.push(path)
}

const handleDrawerSelect = (path) => {
  handleMenuSelect(path)
}

const handleSearch = () => {
  const keyword = searchKeyword.value.trim()
  if (!keyword) {
    ElMessage.warning('请输入搜索关键词')
    return
  }
  ElMessage.success(`已为您查找 “${keyword}” 相关内容`)
}

const goToMy = () => {
  router.push('/my')
}

const goToProfile = () => {
  router.push('/my/profile')
}

const goToLogin = () => {
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

// 获取用户信息（从 store 或默认值）
const currentUser = computed(() => userStore.userInfo || {
  name: '游客',
  uid: '未登录',
  avatar: 'https://picsum.photos/80?grayscale&random=12'
})

const openDrawer = () => {
  drawerVisible.value = true
}

// 页面加载时初始化
onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
  // 从 localStorage 恢复用户信息
  userStore.restoreFromStorage()
})
</script>

<template>
  <div class="app-root">
    <template v-if="showLayout">
      <el-container class="app-shell">
        <el-header class="app-header">
          <div class="header-left">
            <div class="logo-area">
              <span class="logo-mark">Vue优设</span>
            </div>
            <el-menu
              v-if="!isMobile"
              class="app-menu"
              mode="horizontal"
              :default-active="activeMenu"
              background-color="transparent"
              @select="handleMenuSelect"
            >
              <el-menu-item
                v-for="item in menuItems"
                :key="item.path"
                :index="item.path"
              >
                <el-icon>
                  <component :is="item.icon" />
                </el-icon>
                <template #title>
                  <span>{{ item.label }}</span>
                </template>
              </el-menu-item>
            </el-menu>
            <el-button
              v-if="isMobile"
              class="ghost-btn"
              type="primary"
              circle
              @click="openDrawer"
            >
              <el-icon><Menu /></el-icon>
            </el-button>
          </div>

          <div class="header-center">
            <div v-if="!isMobile" class="city-switch">
              <span class="city-label">当前城市</span>
              <el-select
                v-model="city"
                size="large"
                class="city-select"
                :teleported="false"
                placeholder="选择城市"
                filterable
                remote
                :remote-method="handleCitySearch"
                clearable
              >
                <el-option
                  v-for="item in cityOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </el-select>
            </div>
            <div class="header-search">
              <el-input
                v-model="searchKeyword"
                size="large"
                placeholder="搜索房源、服务、活动"
                @keyup.enter="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
                <template #append>
                  <el-button type="primary" @click="handleSearch">搜索</el-button>
                </template>
              </el-input>
            </div>
          </div>

          <div class="header-right">
            <el-popover placement="bottom" width="280" trigger="click" popper-class="notice-popper">
              <template #reference>
                <el-badge :value="unreadCount" class="message-badge" :hidden="!unreadCount">
                  <el-button text circle>
                    <el-icon><Bell /></el-icon>
                  </el-button>
                </el-badge>
              </template>
              <div class="notification-list">
                <div v-for="notice in notifications" :key="notice.id" class="notice-item">
                  <p class="notice-title">{{ notice.title }}</p>
                  <p class="notice-time">{{ notice.time }}</p>
                </div>
                <div class="notice-footer">
                  <el-button link type="primary" @click="router.push('/discover')">
                    查看全部消息
                  </el-button>
                </div>
              </div>
            </el-popover>
            <el-divider direction="vertical" />
            <div class="user-area">
              <el-avatar
                class="user-avatar"
                size="medium"
                :src="currentUser.avatar"
                @click="goToMy"
              />
              <el-dropdown v-if="userStore.isLoggedIn">
                <span class="user-meta-wrapper">
                  <span class="user-meta">
                    <span class="user-name">{{ currentUser.name }}</span>
                    <span class="user-level">{{ currentUser.uid }}</span>
                  </span>
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToMy">我的</el-dropdown-item>
                    <el-dropdown-item divided @click="goToProfile">个人资料</el-dropdown-item>
                    <el-dropdown-item @click="router.push('/my/want')">
                      我的想看
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
              <el-button v-else type="primary" size="small" @click="goToLogin">
                登录
              </el-button>
            </div>
          </div>
        </el-header>

        <el-main class="app-main">
          <el-scrollbar>
            <router-view v-slot="{ Component }">
              <transition name="fade-slide" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </el-scrollbar>
        </el-main>
      </el-container>

      <el-drawer
        v-if="isMobile"
        v-model="drawerVisible"
        :with-header="false"
        size="240px"
        custom-class="app-drawer"
      >
        <div class="drawer-logo">
          <span class="logo-mark">Vue优设</span>
          <p class="logo-slogan">品质租住生活</p>
        </div>
        <el-menu
          class="app-menu"
          :default-active="activeMenu"
          background-color="transparent"
          @select="handleDrawerSelect"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.path"
          >
            <el-icon>
              <component :is="item.icon" />
            </el-icon>
            <template #title>
              <span>{{ item.label }}</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-drawer>
    </template>

    <template v-else>
      <router-view />
    </template>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100%;
}

.app-shell {
  min-height: 100vh;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--border-radius-full);
  background: linear-gradient(135deg, #1e2a68 0%, #12193a 100%);
  color: var(--color-white);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
  letter-spacing: 1px;
  transition: var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.logo-mark:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.app-menu {
  border-bottom: none;
  flex: 0 0 auto;
  overflow: visible !important;
}

.app-menu :deep(.el-menu) {
  overflow: visible !important;
  flex-wrap: nowrap;
}

/* 隐藏省略号子菜单 */
.app-menu :deep(.el-submenu) {
  display: none !important;
}

.app-menu :deep(.el-submenu__title),
.app-menu :deep(.el-menu--collapse) {
  display: none !important;
}

/* 确保所有菜单项都显示 */
.app-menu :deep(.el-menu--horizontal) {
  overflow: visible !important;
  display: flex !important;
  flex-wrap: nowrap !important;
}

.app-menu :deep(.el-menu--horizontal > .el-menu-item) {
  display: inline-flex !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.app-menu :deep(.el-menu-item) {
  height: 48px;
  margin: 0 var(--spacing-xs);
  border-radius: var(--border-radius-sm);
  color: var(--gray-2);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-fast);
  flex-shrink: 0;
  white-space: nowrap;
}

.app-menu :deep(.el-menu-item.is-active),
.app-menu :deep(.el-menu-item:hover) {
  background: var(--brand-primary-soft);
  color: var(--brand-primary);
  transform: translateY(-1px);
}

.app-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
  margin-right: 6px;
}

.app-header {
  height: 72px;
  background: var(--color-white);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--spacing-2xl);
  gap: var(--spacing-2xl);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 0 1 auto;
  min-width: 0;
  overflow: visible;
}

.header-center {
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 1 1 auto;
  justify-content: center;
  min-width: 0;
}

.header-search {
  flex: 1 1 auto;
  min-width: 280px;
  max-width: 500px;
}

.city-switch {
  display: flex;
  align-items: center;
  gap: 10px;
}

.city-label {
  font-size: var(--font-size-sm);
  color: var(--gray-3);
  font-weight: var(--font-weight-medium);
}

.city-select {
  width: 140px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 14px;
}

.message-badge :deep(.is-dot) {
  right: 12px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  max-height: 280px;
  overflow-y: auto;
}

.notice-item {
  padding: 0 4px;
}

.notice-title {
  font-size: var(--font-size-sm);
  color: var(--gray-2);
  margin-bottom: var(--spacing-xs);
  line-height: var(--line-height-normal);
  font-weight: var(--font-weight-medium);
}

.notice-time {
  font-size: var(--font-size-xs);
  color: var(--gray-4);
}

.notice-footer {
  text-align: right;
}

.user-area {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-meta-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.user-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.3;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--gray-1);
}

.user-level {
  font-size: var(--font-size-xs);
  color: var(--gray-4);
}

.app-main {
  background: var(--gray-bg);
  padding: var(--spacing-2xl);
  flex: 1;
  min-height: 0;
}

.ghost-btn {
  border: none;
  background: var(--brand-primary-soft);
  color: var(--brand-primary);
  transition: var(--transition-fast);
}

.ghost-btn:hover {
  background: rgba(47, 84, 235, 0.2);
  transform: scale(1.05);
}

.app-drawer {
  background: linear-gradient(180deg, #1e2a68 0%, #12193a 100%);
  color: #fff;
}

.drawer-logo {
  padding: 20px 16px 8px;
}

.drawer-logo .logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 96px;
}

.drawer-logo .logo-slogan {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.notice-popper {
  padding: 16px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: var(--transition-base);
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(var(--spacing-md));
}

/* 统一响应式断点优化 */
@media (max-width: 1399px) {
  .header-search {
    min-width: 280px;
    max-width: 500px;
  }
  
  .header-center {
    gap: var(--spacing-md);
  }
}

@media (max-width: 1199px) {
  .app-main {
    padding: var(--spacing-xl);
  }

  .header-search {
    min-width: 220px;
    max-width: 400px;
  }
  
  .header-left {
    gap: var(--spacing-lg);
  }
  
  .app-menu :deep(.el-menu-item) {
    margin: 0 var(--spacing-xs);
    padding: 0 var(--spacing-md);
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 1023px) {
  .app-main {
    padding: var(--spacing-lg);
  }

  .header-left {
    gap: var(--spacing-md);
  }
  
  .header-center {
    gap: var(--spacing-sm);
  }
  
  .app-header {
    padding: 0 var(--spacing-lg);
  }
  
  /* 城市选择器始终显示 */
  /* .city-switch {
    display: none;
  } */
}

@media (max-width: 767px) {
  .app-header {
    padding: 0 var(--spacing-lg);
    gap: var(--spacing-md);
    height: 64px;
  }
  
  .header-search {
    min-width: auto;
    max-width: none;
  }

  .header-right {
    gap: var(--spacing-sm);
  }

  .header-left {
    gap: var(--spacing-sm);
  }

  /* 用户信息始终显示 */
  /* .user-meta {
    display: none;
  } */
  
  .logo-mark {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-size-sm);
  }

  .app-menu :deep(.el-menu-item) {
    padding: 0 var(--spacing-sm);
    font-size: var(--font-size-xs);
  }
}
</style>
