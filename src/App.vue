<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const route = useRoute()

const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1920)
const manualCollapsed = ref(false)
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
  },
  {
    path: '/my',
    label: '我的',
    icon: 'User'
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
    title: '【服务提醒】“深度保洁”预约将在明日09:00开始。',
    time: '昨天'
  }
])

const unreadCount = computed(() => notifications.value.length)
const showLayout = computed(() => route.meta?.layout !== 'blank')
const isMobile = computed(() => viewportWidth.value < 1024)
const isTablet = computed(() => viewportWidth.value >= 1024 && viewportWidth.value < 1200)
const isDesktop = computed(() => viewportWidth.value >= 1200)
const effectiveCollapsed = computed(() => {
  if (isMobile.value) return true
  if (isTablet.value) return true
  return manualCollapsed.value
})
const asideWidth = computed(() => (effectiveCollapsed.value ? '64px' : '240px'))
const activeMenu = computed(() => route.meta?.activeMenu ?? route.path)

const handleResize = () => {
  viewportWidth.value = window.innerWidth
  if (isTablet.value) {
    manualCollapsed.value = true
  }
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

const toggleCollapse = () => {
  manualCollapsed.value = !manualCollapsed.value
}

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
        <template v-if="!isMobile">
          <el-aside
            class="app-aside"
            :width="asideWidth"
            :class="{ 'app-aside--collapsed': effectiveCollapsed }"
          >
            <div class="logo-area">
              <span class="logo-mark">Vue优设</span>
              <span v-if="!effectiveCollapsed" class="logo-slogan">一站式品质租住生活</span>
            </div>
            <el-menu
              class="app-menu"
              :collapse="effectiveCollapsed"
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
            <div class="aside-footer">
              <el-button v-if="isDesktop" text class="collapse-btn" @click="toggleCollapse">
                <el-icon>
                  <component :is="effectiveCollapsed ? 'Expand' : 'Fold'" />
                </el-icon>
                <span v-if="!effectiveCollapsed">收起菜单</span>
              </el-button>
              <div class="service-banner" v-if="!effectiveCollapsed">
                <p class="banner-title">智能助手</p>
                <p class="banner-desc">快速预约保洁、搬家、活动咨询。</p>
                <el-button type="primary" size="small" plain>打开coze智能体</el-button>
              </div>
            </div>
          </el-aside>
        </template>

        <el-container>
          <el-header class="app-header">
            <div class="header-left">
              <el-button
                v-if="isMobile"
                class="ghost-btn"
                type="primary"
                circle
                @click="openDrawer"
              >
                <el-icon><Menu /></el-icon>
              </el-button>
              <div v-else class="city-switch">
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
              <el-dropdown>
                <span class="user-entry">
                  <el-avatar
                    size="medium"
                    src="https://picsum.photos/80?grayscale&random=12"
                  />
                  <span class="user-meta">
                    <span class="user-name">张租客</span>
                    <span class="user-level">UID 278930</span>
                  </span>
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="goToProfile">个人资料</el-dropdown-item>
                    <el-dropdown-item @click="router.push('/my/want')">
                      我的想看
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="goToLogin">退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
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

.app-aside {
  background: linear-gradient(180deg, #1e2a68 0%, #12193a 100%);
  color: #fff;
  display: flex;
  flex-direction: column;
  transition: var(--transition-base);
  padding: 18px 0 12px;
}

.app-aside--collapsed {
  align-items: center;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  margin-bottom: 24px;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 1px;
}

.logo-slogan {
  font-size: 13px;
  opacity: 0.75;
}

.app-menu {
  border-right: none;
  flex: 1;
}

.app-menu :deep(.el-menu-item) {
  height: 48px;
  margin: 6px 12px;
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.75);
  font-size: 15px;
  transition: var(--transition-base);
}

.app-menu :deep(.el-menu-item.is-active),
.app-menu :deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.app-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

.aside-footer {
  padding: 0 16px 12px;
}

.collapse-btn {
  width: 100%;
  justify-content: center;
  color: rgba(255, 255, 255, 0.65);
}

.collapse-btn:hover {
  color: #fff;
}

.service-banner {
  margin-top: 16px;
  background: rgba(47, 84, 235, 0.18);
  padding: 18px;
  border-radius: var(--border-radius-md);
  color: #fff;
}

.banner-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
}

.banner-desc {
  font-size: 12px;
  line-height: 1.5;
  margin-bottom: 12px;
  opacity: 0.85;
}

.app-header {
  height: 72px;
  background: #fff;
  border-bottom: 1px solid #eef0f8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  gap: 12px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 18px;
  flex: 1;
}

.header-search {
  flex: 1;
  min-width: 360px;
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

.user-entry {
  display: inline-flex;
  align-items: center;
  gap: 10px;
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
  }
}

@media (max-width: 1199px) {
  .app-main {
    padding: 20px;
  }

  .header-search {
    min-width: 220px;
  }
}

@media (max-width: 1023px) {
  .app-main {
    padding: 16px;
  }

  .header-left {
    gap: 12px;
  }
}

@media (max-width: 767px) {
  .header-search {
    min-width: auto;
  }

  .header-right {
    gap: 10px;
  }

  .user-meta {
    display: none;
  }
}
</style>
