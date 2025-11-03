<script setup>
import { useRouter } from 'vue-router'
import { discoverActivities, discoverBenefits } from '../data/mockData'

const router = useRouter()

const goToActivity = (id) => {
  router.push(`/activity/${id}`)
}

const goToBenefit = (id) => {
  router.push(`/benefit/${id}`)
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>发现</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>社区活动与福利 · 发现更多生活惊喜</h2>
      </div>
      <el-tag type="primary" effect="dark" size="large">每周更新 · 社区精选</el-tag>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">活动展示区</span>
        <el-text type="info">线下社交 · 兴趣小组 · 线上讲座，随时报名</el-text>
      </div>
      <div class="grid grid--3 activity-grid">
        <el-card
          v-for="activity in discoverActivities"
          :key="activity.id"
          shadow="hover"
          class="activity-card"
        >
          <img :src="activity.cover" alt="" class="activity-card__cover" />
          <div class="activity-card__body">
            <div class="activity-card__head">
              <h4>{{ activity.title }}</h4>
              <el-tag type="success" effect="dark">{{ activity.tag }}</el-tag>
            </div>
            <p class="activity-card__meta">
              <el-icon><Clock /></el-icon>
              {{ activity.time }}
            </p>
            <p class="activity-card__meta">
              <el-icon><Location /></el-icon>
              {{ activity.location }}
            </p>
            <p class="activity-card__desc">{{ activity.desc }}</p>
            <div class="activity-card__actions">
              <el-button type="primary" plain @click="goToActivity(activity.id)">
                查看详情
              </el-button>
              <el-button link type="primary">立即报名</el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">福利专区</span>
        <el-text type="info">优惠券、积分兑换、免费试用，为生活加点福利</el-text>
      </div>
      <div class="grid grid--3 benefit-grid">
        <el-card
          v-for="benefit in discoverBenefits"
          :key="benefit.id"
          class="benefit-card"
          shadow="hover"
        >
          <img :src="benefit.cover" alt="" class="benefit-card__cover" />
          <div class="benefit-card__body">
            <div class="benefit-card__head">
              <el-tag type="primary" effect="dark">{{ benefit.type }}</el-tag>
              <span class="benefit-card__expire">有效期至 {{ benefit.expire }}</span>
            </div>
            <h4>{{ benefit.title }}</h4>
            <p>{{ benefit.desc }}</p>
            <div class="benefit-card__actions">
              <el-button type="primary" plain @click="goToBenefit(benefit.id)">查看详情</el-button>
              <el-button link type="primary">立即领取</el-button>
            </div>
          </div>
        </el-card>
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

.activity-grid,
.benefit-grid {
  gap: 20px;
}

.activity-card,
.benefit-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.activity-card__cover,
.benefit-card__cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
}

.activity-card__body,
.benefit-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.activity-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.activity-card__head h4 {
  margin: 0;
  font-size: 18px;
  color: var(--gray-1);
}

.activity-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--gray-3);
}

.activity-card__desc {
  margin: 0;
  font-size: 14px;
  color: var(--gray-2);
  line-height: 1.6;
}

.activity-card__actions,
.benefit-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.benefit-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--gray-4);
}

.benefit-card__body h4 {
  margin: 4px 0 0;
  font-size: 18px;
  color: var(--gray-1);
}

.benefit-card__body p {
  margin: 4px 0 0;
  color: var(--gray-3);
  line-height: 1.6;
}

@media (max-width: 991px) {
  .activity-grid {
    grid-template-columns: repeat(2, minmax(240px, 1fr));
  }
}

@media (max-width: 767px) {
  .activity-grid,
  .benefit-grid {
    grid-template-columns: repeat(1, minmax(220px, 1fr));
  }

  .activity-card__cover,
  .benefit-card__cover {
    height: 180px;
  }
}
</style>
