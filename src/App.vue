<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920)
const drawerVisible = ref(false)
const city = ref('北京')
const searchKeyword = ref('')

const cityOptions = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '重庆',
  '苏州'
]

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

const openDrawer = () => {
  drawerVisible.value = true
}
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
                src="https://picsum.photos/80?grayscale&random=12"
                @click="goToMy"
              />
              <el-dropdown>
                <span class="user-meta-wrapper">
                  <span class="user-meta">
                    <span class="user-name">张租客</span>
                    <span class="user-level">UID 278930</span>
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
                    <el-dropdown-item divided @click="goToLogin">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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
  padding: 8px 14px;
  border-radius: 999px;
  background: linear-gradient(135deg, #1e2a68 0%, #12193a 100%);
  color: #fff;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 1px;
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
  margin: 0 4px;
  border-radius: 8px;
  color: var(--gray-2);
  font-size: 15px;
  transition: var(--transition-base);
  flex-shrink: 0;
  white-space: nowrap;
}

.app-menu :deep(.el-menu-item.is-active),
.app-menu :deep(.el-menu-item:hover) {
  background: rgba(47, 84, 235, 0.1);
  color: var(--brand-primary);
}

.app-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
  margin-right: 6px;
}

.app-header {
  height: 72px;
  background: #fff;
  border-bottom: 1px solid #eef0f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
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
  font-size: 14px;
  color: var(--gray-3);
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
  font-size: 13px;
  color: var(--gray-2);
  margin-bottom: 6px;
  line-height: 1.5;
}

.notice-time {
  font-size: 12px;
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
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-1);
}

.user-level {
  font-size: 12px;
  color: var(--gray-4);
}

.app-main {
  background: var(--gray-bg);
  padding: 24px;
}

.ghost-btn {
  border: none;
  background: rgba(47, 84, 235, 0.12);
  color: var(--brand-primary);
}

.ghost-btn:hover {
  background: rgba(47, 84, 235, 0.2);
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
  transition: all 0.25s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 1399px) {
  .header-search {
    min-width: 280px;
    max-width: 500px;
  }
  
  .header-center {
    gap: 12px;
  }
}

@media (max-width: 1199px) {
  .app-main {
    padding: 20px;
  }

  .header-search {
    min-width: 220px;
    max-width: 400px;
  }
  
  .header-left {
    gap: 16px;
  }
  
  .app-menu :deep(.el-menu-item) {
    margin: 0 2px;
    padding: 0 12px;
  }
}

@media (max-width: 1023px) {
  .app-main {
    padding: 16px;
  }

  .header-left {
    gap: 12px;
  }
  
  .header-center {
    gap: 10px;
  }
  
  /* 城市选择器始终显示 */
  /* .city-switch {
    display: none;
  } */
}

@media (max-width: 767px) {
  .app-header {
    padding: 0 16px;
    gap: 12px;
  }
  
  .header-search {
    min-width: auto;
    max-width: none;
  }

  .header-right {
    gap: 8px;
  }

  /* 用户信息始终显示 */
  /* .user-meta {
    display: none;
  } */
  
  .logo-mark {
    padding: 6px 12px;
    font-size: 14px;
  }
}
</style>
