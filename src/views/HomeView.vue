<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, Location } from '@element-plus/icons-vue'
import {
  bannerSlides,
  featuredProperties,
  nearbyProperties,
  serviceShortcuts
} from '../data/mockData'

const router = useRouter()

const sortState = ref({
  prop: null,
  order: null
})

const sortedNearby = computed(() => {
  const result = [...nearbyProperties]
  if (!sortState.value.order || !sortState.value.prop) {
    return result
  }

  const multiplier = sortState.value.order === 'ascending' ? 1 : -1

  return result.sort((a, b) => {
    const prop = sortState.value.prop
    if (prop === 'price' || prop === 'size') {
      return (a[prop] - b[prop]) * multiplier
    }
    if (prop === 'release') {
      return (
        (new Date(a.release).getTime() - new Date(b.release).getTime()) *
        multiplier
      )
    }
    return 0
  })
})

const handleSortChange = ({ prop, order }) => {
  sortState.value = {
    prop,
    order
  }
}

const goToProperty = (id) => {
  // 确保id是有效的
  if (id !== undefined && id !== null) {
    try {
      const propertyId = String(id).trim()
      if (propertyId) {
        router.push(`/property/${propertyId}`)
      }
    } catch (error) {
      console.error('房源详情跳转失败:', error)
      ElMessage.error('页面跳转失败，请重试')
    }
  }
}

const handleShortcutClick = (link) => {
  router.push(link)
}

// Banner 跳转处理
const handleBannerClick = (link) => {
  if (link) {
    router.push(link)
  }
}

// 立即找房 - 跳转到想看页面
const goToList = () => {
  router.push('/want')
}

// 我要出租 - 暂未实现
const showRentalForm = () => {
  ElMessage.info('我要出租功能开发中，敬请期待')
}

// 服务保障数据
const services = ref([
  {
    id: 1,
    icon: 'el-icon-check',
    title: '真实房源保障',
    description: '严格审核房源信息，确保真实可靠，杜绝虚假房源'
  },
  {
    id: 2,
    icon: 'el-icon-document',
    title: '合同安全保障',
    description: '标准化租赁合同，法律保障双方权益，透明公正'
  },
  {
    id: 3,
    icon: 'el-icon-headset',
    title: '全程客服支持',
    description: '专业客服团队，7×24小时在线服务，解决您的问题'
  }
])

const shortcutsChunks = computed(() => {
  const chunkSize = 4
  const chunks = []
  for (let i = 0; i < serviceShortcuts.length; i += chunkSize) {
    chunks.push(serviceShortcuts.slice(i, i + chunkSize))
  }
  return chunks
})
</script>

<template>
  <div class="page-wrapper">
    <el-row>
      <el-col :span="8">
        <div class="banner-header">
          <div class="banner-content">
            <h1>找到您的理想住所</h1>
            <p>精选优质房源，智能匹配居住需求，享受便捷租赁体验</p>
            <div class="banner-buttons">
              <el-button type="primary" @click="goToList" style="background-color: #09f; color: #fff; border-color: #09f;">立即找房</el-button>
              <el-button type="default" @click="showRentalForm" style="background-color: transparent; color: #fff; border-color: #fff;">我要出租</el-button>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :span="16"> 
        <el-carousel v-if="bannerSlides.length > 0" height="320px" trigger="click" indicator-position="outside">
          <el-carousel-item
            v-for="item in bannerSlides"
            :key="`banner-top-${item.id}`"
            @click="router.push(item.link)"
          >
            <div class="banner" :style="{ backgroundImage: `url(${item.cover})` }" @click.stop="handleBannerClick(item.link)">
              <div class="banner__content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
                <el-button type="primary" size="large" @click.stop="handleBannerClick(item.link)">立即查看</el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
      </el-col>
    </el-row>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">精选房源推荐</span>
        <el-button type="primary" text @click="goToList">
          查看更多房源
          <el-icon class="ml-4"><ArrowRight /></el-icon>
        </el-button>
      </div>
      <div class="grid grid--3 property-grid">
        <el-card
          v-for="item in featuredProperties"
          :key="item.id"
          shadow="hover"
          class="property-card"
        >
          <img :src="item.cover" class="property-card__cover" alt="房源图片" />
          <div class="property-card__body">
            <div class="property-card__header">
              <h4>{{ item.title }}</h4>
              <el-tag type="primary" effect="dark">{{ item.rentType }}</el-tag>
            </div>
            <p class="property-card__price">
              <strong>{{ item.price.toLocaleString() }} 元/月</strong>
            </p>
            <p class="property-card__desc">{{ item.desc }}</p>
            <p class="property-card__area">
              <el-icon><Location /></el-icon>
              {{ item.area }}
            </p>
            <div class="property-card__tags">
              <el-tag v-for="tag in item.tags" :key="tag" type="info" size="small">
                {{ tag }}
              </el-tag>
            </div>
            <el-button type="primary" plain block @click="goToProperty(item.id)">
              查看详情
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <el-row>
      <el-col :span="12">
        <div class="section-card">
          <div class="section-card__header">
            <span class="section-card__title">发现</span>
            <el-text type="info">社区活动与福利 · 发现更多生活惊喜</el-text>
          </div>
          <el-carousel v-if="bannerSlides.length > 0" height="320px" trigger="click" indicator-position="outside">
          <el-carousel-item
            v-for="item in bannerSlides"
            :key="`banner-discover-${item.id}`"
            @click="router.push(item.link)"
          >
            <div class="banner" :style="{ backgroundImage: `url(${item.cover})` }" @click.stop="handleBannerClick(item.link)">
              <div class="banner__content">
                <h3>{{ item.title }}</h3>
                <p>{{ item.description }}</p>
                <el-button type="primary" size="large" @click.stop="handleBannerClick(item.link)">立即查看</el-button>
              </div>
            </div>
          </el-carousel-item>
        </el-carousel>
        </div>
      </el-col>
      <el-col :span="12"> 
        <div class="section-card">
              <div class="section-card__header">
                <span class="section-card__title">生活服务入口</span>
                <el-text type="info">搬家、保洁、维修、家电清洗等一站预约</el-text>
              </div>
              <div class="shortcuts">
                <div
                  v-for="(chunk, index) in shortcutsChunks"
                  :key="index"
                  class="shortcuts__row"
                >
                  <div
                    v-for="item in chunk"
                    :key="item.id"
                    class="shortcut-item"
                    @click="handleShortcutClick(item.link)"
                  >
                    <el-icon class="shortcut-item__icon">
                      <component :is="item.icon" />
                    </el-icon>
                    <div class="shortcut-item__info">
                      <h5>{{ item.title }}</h5>
                      <p>{{ item.desc }}</p>
                    </div>
                    <el-icon><ArrowRight /></el-icon>
                  </div>
                </div>
              </div>
        </div>
      </el-col>
    </el-row>
    

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">周边房源推荐</span>
        <div class="table-hint">
          <el-tag type="warning" effect="plain">支持排序 · 收藏 · 约看</el-tag>
        </div>
      </div>
      <div class="table-wrapper">
        <el-table
          :data="sortedNearby"
          stripe
          @sort-change="handleSortChange"
          style="width: 100%"
        >
        <el-table-column label="图片" width="120">
          <template #default="scope">
            <el-image
              :src="scope.row.cover"
              fit="cover"
              class="table-thumb"
              lazy
            />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="280" show-overflow-tooltip>
          <template #default="scope">
            <div class="table-title">
              <el-button type="primary" link @click="goToProperty(scope.row.id)">
                {{ scope.row.title }}
              </el-button>
              <p class="table-sub">{{ scope.row.address }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="价格"
          width="130"
          sortable="custom"
        >
          <template #default="scope">
            <span class="table-price">{{ scope.row.price }} 元/月</span>
          </template>
        </el-table-column>
        <el-table-column prop="layout" label="户型" width="110" />
        <el-table-column
          prop="size"
          label="面积㎡"
          width="110"
          sortable="custom"
        />
        <el-table-column prop="release" label="发布时间" width="150" sortable="custom">
          <template #default="scope">
            <el-tag type="info" effect="plain">{{ scope.row.release }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-space>
              <el-button type="primary" text @click="goToProperty(scope.row.id)">
                查看详情
              </el-button>
              <el-button type="success" text>预约看房</el-button>
            </el-space>
          </template>
        </el-table-column>
        </el-table>
      </div>
    </div>
  </div>

   <!-- 贴心服务保障 -->
    <div class="services">
      <h2 class="section-title">贴心服务保障</h2>
      <div class="services-content">
        <div class="service-item" v-for="service in services" :key="service.id">
          <i :class="service.icon"></i>
          <h3 class="service-title">{{ service.title }}</h3>
          <p class="service-desc">{{ service.description }}</p>
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

/* Banner内容样式 */
.banner-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding-bottom: 90px;
}
.banner-content h1 {
  padding-top: 70px;
  font-size: 36px;
  color: #fff;
  margin-bottom: 15px;
  font-weight: 600;
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 30px;
  opacity: 0.9;
}

/* 共享背景的头部区域 */
.banner-header {
  background-size: cover;
  background-position: center;
  color: #fff;
  height: 320px;
  position: relative;
  padding-top: 15px;
  background-image: url('/src/data/picture/braground.png');
  background-size: 100%;
}

.banner-header::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 128, 96, 0.6), rgba(0, 128, 96, 0.8));
  z-index: 1;
}

.banner {
  position: relative;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: 0;
  overflow: hidden;
  cursor: pointer;
}

.banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.05) 100%);
}

.banner__content {
  position: absolute;
  inset: 0;
  padding: 48px;
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 16px;
  max-width: 540px;
}

.banner__content h3 {
  font-size: 28px;
  margin: 0;
}

.banner__content p {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.85;
}

.property-grid {
  margin-top: 8px;
  align-items: stretch;
}

.property-grid .el-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.property-card {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.property-card :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 0 !important;
  height: 100%;
  min-height: 0;
}

.property-card__cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  flex-shrink: 0;
}

.property-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 16px 16px;
  flex: 1 1 auto;
  min-height: 0;
}

.property-card__tags {
  flex-shrink: 0;
  color: rgb(9, 170, 49);
}

.property-card__body > .el-button {
  margin-top: auto;
  flex-shrink: 0;
  width: 100%;
  color: #fff;
}

.property-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.property-card__header h4 {
  margin: 0;
  font-size: 18px;
  color: var(--gray-1);
  flex: 1;
}

.property-card__price strong {
  font-size: 22px;
  color: #e97474;
}

.property-card__desc {
  font-size: 14px;
  color: var(--gray-3);
}

.property-card__area {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--gray-3);
  font-size: 13px;
}

.property-card__tags {
  display: flex;
  flex-wrap: wrap;
  color: aquamarine;
  gap: 8px;
}

.shortcuts {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.shortcuts__row {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.shortcut-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  border-radius: var(--border-radius-md);
  background: rgba(47, 84, 235, 0.08);
  cursor: pointer;
  transition: var(--transition-base);
}

.shortcut-item:hover {
  transform: translateY(-4px);
  background: rgba(47, 84, 235, 0.12);
}

.shortcut-item__icon {
  font-size: 24px;
  color: var(--brand-primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: rgba(47, 84, 235, 0.16);
  border-radius: 12px;
}

.shortcut-item__info h5 {
  margin: 0;
  font-size: 16px;
  color: var(--gray-1);
}

.shortcut-item__info p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--gray-3);
}

.table-thumb {
  width: 100px;
  height: 68px;
  border-radius: var(--border-radius-sm);
  object-fit: cover;
}

.table-title {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-sub {
  font-size: 12px;
  color: var(--gray-3);
}

.table-price {
  font-weight: 600;
  color: var(--brand-primary);
}

.table-hint {
  display: flex;
  align-items: center;
  gap: 8px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.table-wrapper :deep(.el-table) {
  min-width: 100%;
}

.table-wrapper :deep(.el-table__body-wrapper),
.table-wrapper :deep(.el-table__header-wrapper) {
  overflow-x: visible;
}

.table-wrapper :deep(.el-table td),
.table-wrapper :deep(.el-table th) {
  overflow: visible;
}

/* 标题列允许换行显示完整内容 */
.table-wrapper :deep(.el-table td .table-title) {
  white-space: normal;
  word-break: break-word;
}

.table-title {
  white-space: normal;
  word-break: break-word;
  min-width: 0;
}

.table-title .el-button {
  white-space: normal;
  text-align: left;
  word-break: break-word;
  height: auto;
  line-height: 1.5;
  padding: 0;
  display: block;
}

.table-sub {
  white-space: normal;
  word-break: break-word;
}

/* 确保表格中的所有按钮可见 */
.table-wrapper :deep(.el-button--text),
.table-wrapper :deep(.el-button.is-link) {
  background: transparent !important;
}

.table-wrapper :deep(.el-button--text.el-button--primary),
.table-wrapper :deep(.el-button.is-link.el-button--primary) {
  color: var(--brand-primary) !important;
  border: none !important;
}

.table-wrapper :deep(.el-button--text.el-button--success) {
  color: var(--brand-success) !important;
}

.table-wrapper :deep(.el-button--text:hover),
.table-wrapper :deep(.el-button.is-link:hover) {
  background: var(--brand-primary-soft) !important;
}

.table-wrapper :deep(.el-button--text.el-button--success:hover) {
  background: var(--brand-success-soft) !important;
}

/* 标题按钮特殊处理 */
.table-title :deep(.el-button) {
  color: var(--brand-primary) !important;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
}

.table-title :deep(.el-button:hover) {
  color: var(--brand-primary-light) !important;
  background: transparent !important;
  text-decoration: underline;
}

@media (max-width: 1199px) {
  .banner__content {
    padding: 36px;
  }

  .property-card__cover {
    height: 180px;
  }
}

@media (max-width: 767px) {
  .banner-card :deep(.el-carousel__container) {
    height: 240px !important;
  }

  .banner__content h3 {
    font-size: 22px;
  }

  .banner__content {
    padding: 24px;
  }

  .header-search {
    min-width: auto;
  }

  .shortcuts__row {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

.services {
  background-color: #fff;
  margin-top: 20px;
  padding: 30px 0;
}

/* 区块标题共享样式 */
.section-title {
  font-size: 24px;
  font-weight: 600;
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

/* 内容容器共享样式 */
.services-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  padding: 0 20px;
}

</style>
