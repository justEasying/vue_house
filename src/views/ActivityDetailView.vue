<script setup>
import { useRouter } from 'vue-router'
import { activityDetail } from '../data/mockData'

const detail = activityDetail
const router = useRouter()

const handleSignup = () => {
  router.push('/discover')
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item to="/discover">发现</el-breadcrumb-item>
          <el-breadcrumb-item>活动详情</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>{{ detail.title }}</h2>
      </div>
      <el-tag type="success" effect="dark">{{ detail.status }}</el-tag>
    </div>

    <div class="section-card">
      <img :src="detail.cover" alt="" class="hero-img" />
      <div class="hero-info">
        <div class="info-item">
          <el-icon><Clock /></el-icon>
          {{ detail.time }}
        </div>
        <div class="info-item">
          <el-icon><Location /></el-icon>
          {{ detail.location }}
        </div>
        <div class="info-item">
          <el-icon><User /></el-icon>
          主办方：{{ detail.host }}
        </div>
        <el-button type="primary" size="large" @click="handleSignup">立即报名</el-button>
      </div>
      <p class="detail-text">{{ detail.description }}</p>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">活动流程</span>
      </div>
      <el-timeline>
        <el-timeline-item
          v-for="item in detail.agenda"
          :key="item.time"
          :timestamp="item.time"
          type="primary"
        >
          {{ item.content }}
        </el-timeline-item>
      </el-timeline>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">报名须知</span>
      </div>
      <ul class="faq-list">
        <li v-for="item in detail.faq" :key="item">
          <el-icon><InfoFilled /></el-icon>
          {{ item }}
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
  height: 260px;
  object-fit: cover;
  border-radius: var(--border-radius-lg);
  margin-bottom: 16px;
}

.hero-info {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-2);
}

.detail-text {
  margin: 0;
  color: var(--gray-2);
  line-height: 1.8;
}

.faq-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  color: var(--gray-2);
}

.faq-list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  font-size: 14px;
}

@media (max-width: 767px) {
  .hero-img {
    height: 200px;
  }
}
</style>
