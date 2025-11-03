<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { mapBoundary, propertyDetail } from '../data/mockData'

const router = useRouter()
const detail = propertyDetail

const markerPosition = computed(() => {
  const { lat, lng } = detail.map
  const left = ((lng - mapBoundary.west) / (mapBoundary.east - mapBoundary.west)) * 100
  const top = ((mapBoundary.north - lat) / (mapBoundary.north - mapBoundary.south)) * 100
  return {
    left: `${left}%`,
    top: `${top}%`
  }
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title detail-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item to="/want">想看</el-breadcrumb-item>
          <el-breadcrumb-item>房源详情</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>{{ detail.title }}</h2>
      </div>
      <el-button text type="primary" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
        返回上一页
      </el-button>
    </div>

    <div class="detail-layout">
      <div class="detail-main">
        <div class="section-card media-section">
          <el-carousel height="400px" trigger="click" indicator-position="outside">
            <el-carousel-item v-for="img in detail.gallery" :key="img">
              <el-image :src="img" fit="cover" class="gallery-img" />
            </el-carousel-item>
          </el-carousel>
          <div class="info-bar">
            <div class="price">
              <span class="amount">{{ detail.price.toLocaleString() }}</span>
              <span class="unit">元/月</span>
            </div>
            <div class="summary">
              <span>{{ detail.layout }}</span>
              <el-divider direction="vertical" />
              <span>{{ detail.area }}㎡</span>
              <el-divider direction="vertical" />
              <span>{{ detail.orientation }}</span>
              <el-divider direction="vertical" />
              <span>{{ detail.floor }}</span>
            </div>
            <div class="actions">
              <el-button type="primary" size="large">预约看房</el-button>
              <el-button size="large" plain>加入想看</el-button>
              <el-button size="large" text>
                <el-icon><Share /></el-icon>
                分享
              </el-button>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-card__header">
            <span class="section-card__title">房源亮点</span>
            <el-text type="info">真实房源 · 平台认证 · 最新发布 {{ detail.release }}</el-text>
          </div>
          <div class="highlight-tags">
            <el-tag
              v-for="tag in detail.highlights"
              :key="tag"
              size="large"
              effect="plain"
              type="success"
            >
              <el-icon><CircleCheck /></el-icon>
              {{ tag }}
            </el-tag>
          </div>
          <p class="detail-description">{{ detail.description }}</p>
        </div>

        <div class="section-card">
          <div class="section-card__header">
            <span class="section-card__title">配套设施</span>
          </div>
          <div class="facility-grid">
            <div v-for="item in detail.facilities" :key="item" class="facility-item">
              <el-icon><Select /></el-icon>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>

        <div class="section-card">
          <div class="section-card__header">
            <span class="section-card__title">交通与周边</span>
          </div>
          <p class="detail-description">{{ detail.traffic }}</p>
          <div class="map-container">
            <div class="map-grid">
              <div class="grid-line horizontal" v-for="n in 3" :key="`h-${n}`"></div>
              <div class="grid-line vertical" v-for="n in 3" :key="`v-${n}`"></div>
            </div>
            <div class="map-marker" :style="markerPosition">
              <span class="map-marker__price">{{ detail.price }} 元/月</span>
              <span class="map-marker__title">{{ detail.title }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-side">
        <div class="section-card landlord-card">
          <div class="landlord-header">
            <el-avatar :src="detail.landlord.avatar" size="large" />
            <div>
              <h4>{{ detail.landlord.name }}</h4>
              <p>评分 {{ detail.landlord.rating.toFixed(1) }}</p>
            </div>
          </div>
          <el-divider />
          <div class="landlord-contact">
            <el-tag type="primary" effect="dark">电话</el-tag>
            <span>{{ detail.landlord.phone }}</span>
          </div>
          <el-button type="primary" block>联系房东</el-button>
          <el-alert
            title="提示：为保障沟通安全，请通过平台消息或电话联系，谨防私下交易。"
            type="info"
            :closable="false"
            show-icon
          />
        </div>

        <div class="section-card recommend-card">
          <div class="section-card__header">
            <span class="section-card__title">常用操作</span>
          </div>
          <el-space direction="vertical" :size="12" fill>
            <el-button type="primary" plain>
              <el-icon><Calendar /></el-icon>
              安排线下看房
            </el-button>
            <el-button plain>
              <el-icon><Message /></el-icon>
              咨询智能顾问
            </el-button>
            <el-button plain>
              <el-icon><Document /></el-icon>
              查看租赁合同范本
            </el-button>
          </el-space>
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

.detail-title {
  align-items: center;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(280px, 2fr);
  gap: 24px;
}

.detail-main {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-side {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.media-section {
  padding: 0;
  overflow: hidden;
}

.gallery-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-bar {
  padding: 20px 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
  align-items: center;
  border-top: 1px solid #eef0f8;
}

.price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.amount {
  font-size: 32px;
  color: var(--brand-primary);
  font-weight: 700;
}

.unit {
  font-size: 14px;
  color: var(--gray-3);
}

.summary {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  color: var(--gray-2);
}

.actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
}

.highlight-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 14px;
}

.highlight-tags :deep(.el-tag) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.detail-description {
  font-size: 14px;
  color: var(--gray-2);
  line-height: 1.8;
  margin: 0;
}

.facility-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 12px;
}

.facility-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: var(--border-radius-md);
  background: rgba(47, 84, 235, 0.08);
  color: var(--brand-primary);
}

.map-container {
  position: relative;
  height: 320px;
  border-radius: 18px;
  background: linear-gradient(180deg, #f4f7ff 0%, #dfe7ff 100%);
  margin-top: 16px;
}

.map-grid {
  position: absolute;
  inset: 0;
}

.grid-line {
  position: absolute;
  background: rgba(47, 84, 235, 0.12);
}

.grid-line.horizontal {
  height: 1px;
  width: 100%;
}

.grid-line.vertical {
  width: 1px;
  height: 100%;
}

.grid-line.horizontal:nth-child(1) {
  top: 25%;
}
.grid-line.horizontal:nth-child(2) {
  top: 50%;
}
.grid-line.horizontal:nth-child(3) {
  top: 75%;
}
.grid-line.vertical:nth-child(4) {
  left: 25%;
}
.grid-line.vertical:nth-child(5) {
  left: 50%;
}
.grid-line.vertical:nth-child(6) {
  left: 75%;
}

.map-marker {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
}

.map-marker__price {
  background: var(--brand-primary);
  color: #fff;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
  box-shadow: 0 12px 24px rgba(47, 84, 235, 0.28);
}

.map-marker__title {
  background: rgba(47, 84, 235, 0.16);
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: var(--brand-primary);
}

.landlord-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.landlord-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.landlord-header h4 {
  margin: 0;
  font-size: 16px;
  color: var(--gray-1);
}

.landlord-header p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--gray-3);
}

.landlord-contact {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: var(--gray-1);
}

.recommend-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 1199px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .info-bar {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .summary {
    justify-content: center;
  }

  .actions {
    justify-content: center;
  }
}

@media (max-width: 767px) {
  .info-bar {
    padding: 16px;
  }

  .actions {
    flex-direction: column;
  }

  .facility-grid {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }
}
</style>
