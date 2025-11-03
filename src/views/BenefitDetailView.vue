<script setup>
import { benefitDetail } from '../data/mockData'

const detail = benefitDetail
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item to="/discover">发现</el-breadcrumb-item>
          <el-breadcrumb-item>福利详情</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>{{ detail.title }}</h2>
      </div>
      <el-tag type="primary" effect="dark">{{ detail.type }}</el-tag>
    </div>

    <div class="section-card">
      <img :src="detail.cover" alt="" class="hero-img" />
      <div class="info-grid">
        <div class="info-item">
          <span>领取时间</span>
          <strong>{{ detail.start }} 至 {{ detail.end }}</strong>
        </div>
        <div class="info-item">
          <span>适用服务</span>
          <strong>全品类保洁服务</strong>
        </div>
        <div class="info-item">
          <span>使用门槛</span>
          <strong>订单满 300 元可用</strong>
        </div>
      </div>
      <p class="detail-text">{{ detail.description }}</p>
      <div class="actions">
        <el-button type="primary" size="large">立即领取</el-button>
        <el-button size="large" plain>加入卡包</el-button>
      </div>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">使用方式</span>
      </div>
      <ul class="list">
        <li v-for="item in detail.usage" :key="item">
          <el-icon><Select /></el-icon>
          {{ item }}
        </li>
      </ul>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">规则说明</span>
      </div>
      <ul class="list">
        <li v-for="rule in detail.rules" :key="rule">
          <el-icon><Warning /></el-icon>
          {{ rule }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: var(--border-radius-lg);
  margin-bottom: 16px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  background: rgba(47, 84, 235, 0.08);
  border-radius: var(--border-radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item span {
  font-size: 13px;
  color: var(--gray-3);
}

.info-item strong {
  font-size: 16px;
  color: var(--brand-primary);
}

.detail-text {
  margin: 0 0 16px;
  color: var(--gray-2);
  line-height: 1.8;
}

.actions {
  display: flex;
  gap: 16px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--gray-2);
}

.list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

@media (max-width: 767px) {
  .hero-img {
    height: 180px;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
