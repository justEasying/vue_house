<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  calendarAvailabilities,
  homeServices,
  serviceCampaigns,
  vipServices
} from '../data/mockData'

const router = useRouter()

const today = new Date()
const currentDate = ref(new Date(today.getFullYear(), today.getMonth(), today.getDate()))
const activeDate = ref(formatDate(currentDate.value))

const availabilityMap = computed(() => {
  const map = new Map()
  calendarAvailabilities.forEach((item) => {
    map.set(item.date, item.slots)
  })
  return map
})

const selectedSlots = computed(() => availabilityMap.value.get(activeDate.value) ?? [])

const handleCalendarChange = (val) => {
  activeDate.value = formatDate(new Date(val))
}

const handleVisitService = (link) => {
  router.push(link)
}

const handleVipDetail = (id) => {
  router.push(`/service-detail/${id}`)
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>服务</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>生活服务中心 · 搬家保洁一站预约</h2>
      </div>
      <el-tag type="success" size="large">今日已有 326 笔服务预约</el-tag>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">VIP 服务展示</span>
        <el-text type="info">尊享礼包 · 专属顾问 · 全流程托管</el-text>
      </div>
      <div class="grid grid--3 vip-grid">
        <el-card
          v-for="service in vipServices"
          :key="service.id"
          class="vip-card"
          shadow="hover"
        >
          <img :src="service.cover" alt="" class="vip-card__cover" />
          <div class="vip-card__body">
            <h4>{{ service.title }}</h4>
            <p>{{ service.desc }}</p>
            <ul>
              <li v-for="perk in service.perks" :key="perk">
                <el-icon><SuccessFilled /></el-icon>
                <span>{{ perk }}</span>
              </li>
            </ul>
            <el-button type="primary" plain @click="handleVipDetail(service.id)">
              查看详情
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">家庭服务入口</span>
        <el-text type="info">搬家、保洁、维修、清洗、收纳等服务一键直达</el-text>
      </div>
      <div class="grid grid--3 home-service-grid">
        <div
          v-for="item in homeServices"
          :key="item.id"
          class="home-service-item"
          @click="handleVisitService(item.link)"
        >
          <div class="home-service-item__icon">
            <el-icon><component :is="item.icon" /></el-icon>
          </div>
          <div class="home-service-item__info">
            <h5>{{ item.title }}</h5>
            <p>{{ item.desc }}</p>
          </div>
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
    </div>

    <div class="calendar-section">
      <div class="section-card calendar-card">
        <div class="section-card__header">
          <span class="section-card__title">服务日历</span>
          <el-text type="info">选择日期查看可预约时间段，灰色代表已约满</el-text>
        </div>
        <el-calendar
          v-model="currentDate"
          :range="[
            new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
            new Date(today.getFullYear(), today.getMonth(), today.getDate() + 14)
          ]"
          @input="handleCalendarChange"
        >
          <template #dateCell="{ data }">
            <div
              :class="[
                'calendar-cell',
                availabilityMap.get(data.day) ? 'has-availability' : ''
              ]"
            >
              <span class="day">{{ data.day.split('-').pop() }}</span>
              <span v-if="availabilityMap.get(data.day)" class="status">
                可约 {{ availabilityMap.get(data.day).filter((slot) => slot.status === 'available').length }}
              </span>
            </div>
          </template>
        </el-calendar>
      </div>

      <div class="section-card slot-card">
        <div class="section-card__header">
          <span class="section-card__title">
            {{ activeDate }} 可预约时段
          </span>
          <el-tag v-if="!selectedSlots.length" type="warning" effect="plain">
            当前日期暂无可预约时段
          </el-tag>
        </div>
        <div class="slot-list">
          <el-empty
            v-if="!selectedSlots.length"
            description="请选择有空档的日期，或联系客服协助安排"
          />
          <el-card
            v-for="slot in selectedSlots"
            :key="slot.time"
            shadow="never"
            :class="['slot-item', slot.status]"
          >
            <div class="slot-time">
              <el-icon><Clock /></el-icon>
              <span>{{ slot.time }}</span>
            </div>
            <el-tag v-if="slot.status === 'available'" type="success" effect="plain">
              可预约
            </el-tag>
            <el-tag v-else type="info" effect="plain">已约满</el-tag>
            <el-button
              :type="slot.status === 'available' ? 'primary' : 'default'"
              :disabled="slot.status !== 'available'"
              size="small"
              plain
            >
              预约此时段
            </el-button>
          </el-card>
        </div>
      </div>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">本月优惠活动</span>
        <el-text type="info">精选搬家、保洁、维修等服务优惠，限时领取</el-text>
      </div>
      <div class="grid grid--2 campaign-grid">
        <el-card
          v-for="campaign in serviceCampaigns"
          :key="campaign.id"
          class="campaign-card"
          shadow="hover"
        >
          <img :src="campaign.cover" alt="" class="campaign-card__cover" />
          <div class="campaign-card__body">
            <h4>{{ campaign.title }}</h4>
            <p class="campaign-card__date">
              <el-icon><Calendar /></el-icon>
              {{ campaign.date }}
            </p>
            <p>{{ campaign.desc }}</p>
            <div class="campaign-card__actions">
              <el-button type="primary" plain>查看详情</el-button>
              <el-button link type="primary">立即预约</el-button>
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

.vip-grid img,
.campaign-card__cover {
  width: 100%;
  border-radius: var(--border-radius-md);
  object-fit: cover;
}

.vip-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.vip-card__cover {
  height: 180px;
}

.vip-card__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.vip-card__body h4 {
  margin: 0;
  font-size: 18px;
  color: var(--gray-1);
}

.vip-card__body p {
  margin: 0;
  font-size: 14px;
  color: var(--gray-3);
  line-height: 1.6;
}

.vip-card__body ul {
  margin: 8px 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.vip-card__body li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--gray-2);
  font-size: 13px;
}

.home-service-grid {
  gap: 16px;
}

.home-service-item {
  display: flex;
  align-items: center;
  padding: 18px;
  gap: 16px;
  border-radius: var(--border-radius-md);
  background: rgba(47, 84, 235, 0.08);
  cursor: pointer;
  transition: var(--transition-base);
}

.home-service-item:hover {
  transform: translateY(-4px);
  background: rgba(47, 84, 235, 0.12);
}

.home-service-item__icon {
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

.home-service-item__info h5 {
  margin: 0;
  font-size: 16px;
  color: var(--gray-1);
}

.home-service-item__info p {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--gray-3);
}

.calendar-section {
  display: grid;
  grid-template-columns: minmax(360px, 3fr) minmax(320px, 2fr);
  gap: 24px;
}

.calendar-card :deep(.el-calendar__header) {
  padding: 12px 16px;
}

.calendar-card :deep(.el-calendar-table td) {
  height: 96px;
}

.calendar-cell {
  width: 100%;
  height: 100%;
  padding: 10px;
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
}

.calendar-cell .day {
  font-weight: 600;
  color: var(--gray-1);
}

.calendar-cell.has-availability {
  background: rgba(47, 84, 235, 0.08);
  color: var(--brand-primary);
}

.calendar-cell .status {
  font-size: 12px;
  color: rgba(47, 84, 235, 0.85);
  font-weight: 500;
}

.slot-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slot-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slot-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-radius: var(--border-radius-md);
  background: rgba(15, 23, 42, 0.03);
}

.slot-item.available {
  border: 1px solid rgba(47, 84, 235, 0.25);
}

.slot-item.booked {
  opacity: 0.75;
}

.slot-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--gray-1);
}

.campaign-grid {
  gap: 20px;
}

.campaign-card {
  display: flex;
  gap: 18px;
}

.campaign-card__cover {
  width: 220px;
  height: 160px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
}

.campaign-card__body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.campaign-card__body h4 {
  margin: 0;
  font-size: 18px;
  color: var(--gray-1);
}

.campaign-card__body p {
  margin: 0;
  color: var(--gray-3);
  line-height: 1.6;
}

.campaign-card__date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--brand-primary);
}

.campaign-card__actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

@media (max-width: 1399px) {
  .calendar-section {
    grid-template-columns: 1fr;
  }

  .campaign-card {
    flex-direction: column;
  }

  .campaign-card__cover {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 991px) {
  .home-service-grid {
    grid-template-columns: repeat(2, minmax(200px, 1fr));
  }
}

@media (max-width: 767px) {
  .home-service-grid {
    grid-template-columns: repeat(1, minmax(200px, 1fr));
  }

  .vip-card__cover {
    height: 160px;
  }
}
</style>
