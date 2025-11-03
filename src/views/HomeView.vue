<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
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
  router.push(`/property/${id}`)
}

const handleShortcutClick = (link) => {
  router.push(link)
}

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
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item>首页</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>Vue优设 · 精选好房与生活服务</h2>
      </div>
      <el-tag size="large" type="success">今日已为 2,340 位用户精准匹配</el-tag>
    </div>

    <div class="section-card banner-card">
      <el-carousel height="320px" trigger="click" indicator-position="outside">
        <el-carousel-item
          v-for="item in bannerSlides"
          :key="item.id"
          @click="router.push(item.link)"
        >
          <div
            class="banner"
            :style="{ backgroundImage: `url(${item.cover})` }"
          >
            <div class="banner__content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.description }}</p>
              <el-button type="primary" size="large">立即查看</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">精选房源推荐</span>
        <el-button type="primary" text @click="router.push('/want')">
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
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.banner {
  position: relative;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  cursor: pointer;
}

.banner::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.05) 100%);
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
}

.property-card__body > .el-button {
  margin-top: auto;
  flex-shrink: 0;
  width: 100%;
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
  color: var(--brand-primary);
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
</style>
