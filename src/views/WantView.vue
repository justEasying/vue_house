<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  commuteRecommendations,
  mapBoundary,
  mapMarkers
} from '../data/mockData'

const router = useRouter()

const commuteForm = reactive({
  address: '北京市朝阳区国贸大厦',
  time: 30,
  transport: 'subway'
})

const addressOptions = [
  '北京市朝阳区国贸大厦',
  '北京市东城区王府井',
  '北京市朝阳区望京SOHO',
  '北京市海淀区中关村软件园',
  '北京市朝阳区国贸地铁站'
]

const querySearch = (queryString, cb) => {
  const results = queryString
    ? addressOptions
        .filter((option) => option.toLowerCase().includes(queryString.toLowerCase()))
        .map((item) => ({ value: item }))
    : addressOptions.map((item) => ({ value: item }))
  cb(results)
}

const timeOptions = [
  { label: '30 分钟内', value: 30 },
  { label: '45 分钟内', value: 45 },
  { label: '60 分钟内', value: 60 }
]

const transportOptions = [
  { label: '地铁', value: 'subway', icon: 'Position' },
  { label: '公交', value: 'bus', icon: 'Bus' },
  { label: '驾车', value: 'drive', icon: 'Van' },
  { label: '骑行/步行', value: 'bike', icon: 'Bicycle' }
]

const searchTriggered = ref(true)
const activeCardId = ref(null)

const matchTransport = (item) => {
  if (commuteForm.transport === 'subway') return item.transport.includes('地铁')
  if (commuteForm.transport === 'bus') return item.transport.includes('公交')
  if (commuteForm.transport === 'drive') return item.transport.includes('驾车')
  if (commuteForm.transport === 'bike') return item.transport.includes('步行')
  return true
}

const parseMinutes = (text) => {
  const match = text.match(/(\d+)/)
  return match ? Number(match[1]) : 999
}

const filteredRecommendations = computed(() => {
  if (!searchTriggered.value) {
    return []
  }
  return commuteRecommendations.filter(
    (item) => matchTransport(item) && parseMinutes(item.commuteTime) <= commuteForm.time
  )
})

const mapPoints = computed(() =>
  mapMarkers.map((marker) => {
    const left =
      ((marker.lng - mapBoundary.west) / (mapBoundary.east - mapBoundary.west)) * 100
    const top =
      ((mapBoundary.north - marker.lat) / (mapBoundary.north - mapBoundary.south)) * 100
    return {
      ...marker,
      left,
      top
    }
  })
)

const handleSearch = () => {
  searchTriggered.value = true
  if (filteredRecommendations.value.length) {
    activeCardId.value = filteredRecommendations.value[0].id
  }
}

const handleCardEnter = (id) => {
  activeCardId.value = id
}

const handleMarkerClick = (id) => {
  activeCardId.value = id
  const target = filteredRecommendations.value.find((item) => item.id === id)
  if (target) {
    const cardEl = document.getElementById(`commute-card-${id}`)
    if (cardEl) {
      cardEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      })
    }
  }
}

const goToDetail = (id) => {
  router.push(`/property/${id}`)
}

handleSearch()
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item>想看</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>通勤智能找房 · 让上下班更轻松</h2>
      </div>
      <el-tag size="large" effect="dark" type="primary">已接入 128 条通勤线路</el-tag>
    </div>

    <div class="section-card">
      <div class="section-card__header">
        <span class="section-card__title">填写通勤信息</span>
        <el-text type="info">输入工作地点，选择通勤时长与方式，我们为你推荐符合条件的房源</el-text>
      </div>
      <el-form label-position="top" class="commute-form">
        <el-form-item label="工作 / 通勤地点">
          <el-autocomplete
            v-model="commuteForm.address"
            :fetch-suggestions="querySearch"
            placeholder="请输入工作地点，如“北京市朝阳区国贸大厦”"
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Location /></el-icon>
            </template>
          </el-autocomplete>
        </el-form-item>
        <el-form-item label="希望通勤时长">
          <el-radio-group v-model="commuteForm.time" size="large">
            <el-radio-button
              v-for="item in timeOptions"
              :key="item.value"
              :label="item.value"
            >
              {{ item.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="主要通勤方式">
          <div class="transport-options">
            <div
              v-for="item in transportOptions"
              :key="item.value"
              :class="['transport-card', commuteForm.transport === item.value ? 'is-active' : '']"
              @click="commuteForm.transport = item.value"
            >
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </el-form-item>
        <div class="form-actions">
          <el-button type="primary" size="large" @click="handleSearch">
            <el-icon><Search /></el-icon>
            开始找房
          </el-button>
          <el-button size="large" plain @click="router.push('/want')">
            重置条件
          </el-button>
        </div>
      </el-form>
    </div>

    <div class="content-layout">
      <div class="section-card results-card">
        <div class="section-card__header">
          <span class="section-card__title">通勤找房结果</span>
          <el-tag type="info" effect="plain">
            共匹配 {{ filteredRecommendations.length }} 套房源
          </el-tag>
        </div>

        <div class="results-list">
          <el-empty
            v-if="!filteredRecommendations.length"
            description="当前条件下暂无匹配房源，试试调整通勤时长或交通方式"
          />
          <el-card
            v-for="item in filteredRecommendations"
            :key="item.id"
            :id="`commute-card-${item.id}`"
            shadow="hover"
            class="commute-card"
            :class="{ 'is-active': activeCardId === item.id }"
            @mouseenter="handleCardEnter(item.id)"
            @click="handleMarkerClick(item.id)"
          >
            <img :src="item.cover" alt="" class="commute-card__cover" />
            <div class="commute-card__body">
              <div class="commute-card__head">
                <h4>{{ item.title }}</h4>
                <el-tag type="success" effect="dark">{{ item.commuteTime }}</el-tag>
              </div>
              <p class="commute-card__price">{{ item.price }} 元/月</p>
              <p class="commute-card__meta">
                {{ item.layout }} · {{ item.size }}㎡ · {{ item.transport }}
              </p>
              <p class="commute-card__address">
                <el-icon><LocationFilled /></el-icon>
                {{ item.address }}
              </p>
              <div class="commute-card__tags">
                <el-tag
                  v-for="tag in item.tags"
                  :key="tag"
                  size="small"
                  type="info"
                >
                  {{ tag }}
                </el-tag>
              </div>
              <div class="commute-card__actions">
                <el-button type="primary" plain size="small" @click.stop="goToDetail(item.id)">
                  查看详情
                </el-button>
                <el-button size="small" text>加入想看</el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>

      <div class="section-card map-card">
        <div class="section-card__header">
          <span class="section-card__title">地图找房</span>
          <el-text type="info">点击标记查看房源位置，蓝色为推荐</el-text>
        </div>
        <div class="map-container">
          <div class="map-grid">
            <div class="grid-line horizontal" v-for="n in 3" :key="`h-${n}`"></div>
            <div class="grid-line vertical" v-for="n in 3" :key="`v-${n}`"></div>
          </div>
          <div
            v-for="marker in mapPoints"
            :key="marker.id"
            class="map-marker"
            :class="{ 'is-active': activeCardId === marker.id }"
            :style="{ left: `${marker.left}%`, top: `${marker.top}%` }"
            @click="handleMarkerClick(marker.id)"
          >
            <span class="map-marker__price">{{ marker.price }} 元</span>
            <span class="map-marker__title">{{ marker.title }}</span>
          </div>
        </div>
        <div class="map-legend">
          <div class="legend-item">
            <span class="legend-dot legend-dot--active"></span>
            推荐房源
          </div>
          <div class="legend-item">
            <span class="legend-dot legend-dot--default"></span>
            其他房源
          </div>
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

.commute-form {
  display: grid;
  gap: 18px;
}

.transport-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
}

.transport-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: var(--border-radius-md);
  background: #f4f6ff;
  color: var(--brand-primary);
  cursor: pointer;
  transition: var(--transition-base);
}

.transport-card.is-active {
  background: rgba(47, 84, 235, 0.18);
  box-shadow: 0 10px 30px rgba(47, 84, 235, 0.2);
}

.transport-card:hover {
  transform: translateY(-4px);
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.content-layout {
  display: grid;
  grid-template-columns: minmax(420px, 3fr) minmax(320px, 2fr);
  gap: 24px;
}

.results-card {
  padding-bottom: 12px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 720px;
  overflow-y: auto;
  padding-right: 6px;
}

.results-list::-webkit-scrollbar {
  width: 6px;
}

.results-list::-webkit-scrollbar-thumb {
  background-color: rgba(47, 84, 235, 0.25);
  border-radius: 4px;
}

.commute-card {
  display: flex;
  gap: 18px;
  border-radius: var(--border-radius-lg);
  cursor: pointer;
  transition: var(--transition-base);
}

.commute-card.is-active {
  border: 1px solid rgba(47, 84, 235, 0.35);
  box-shadow: 0 14px 32px rgba(47, 84, 235, 0.18);
}

.commute-card__cover {
  width: 220px;
  height: 160px;
  object-fit: cover;
  border-radius: var(--border-radius-md);
}

.commute-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.commute-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.commute-card__head h4 {
  margin: 0;
  font-size: 18px;
  color: var(--gray-1);
}

.commute-card__price {
  font-size: 18px;
  color: var(--brand-primary);
  font-weight: 600;
}

.commute-card__meta {
  font-size: 13px;
  color: var(--gray-3);
}

.commute-card__address {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--gray-2);
}

.commute-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.commute-card__actions {
  display: flex;
  gap: 12px;
}

.map-card {
  min-height: 640px;
  position: sticky;
  top: 88px;
}

.map-container {
  position: relative;
  background: linear-gradient(180deg, #f7f9ff 0%, #eef2ff 100%);
  border-radius: 20px;
  height: 520px;
  overflow: hidden;
}

.map-grid {
  position: absolute;
  inset: 0;
}

.grid-line {
  position: absolute;
  background: rgba(79, 117, 255, 0.08);
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
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: var(--transition-base);
}

.map-marker__price {
  background: #fff;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--brand-primary);
  font-weight: 600;
  box-shadow: 0 10px 24px rgba(47, 84, 235, 0.25);
}

.map-marker__title {
  font-size: 12px;
  background: rgba(47, 84, 235, 0.12);
  color: var(--gray-2);
  padding: 4px 10px;
  border-radius: 999px;
}

.map-marker.is-active .map-marker__price {
  background: var(--brand-primary);
  color: #fff;
}

.map-legend {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--gray-3);
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot--active {
  background: var(--brand-primary);
}

.legend-dot--default {
  background: rgba(47, 84, 235, 0.3);
}

@media (max-width: 1399px) {
  .content-layout {
    grid-template-columns: 1fr;
  }

  .map-card {
    position: relative;
    top: auto;
  }
}

@media (max-width: 991px) {
  .commute-card {
    flex-direction: column;
  }

  .commute-card__cover {
    width: 100%;
    height: 200px;
  }
}

@media (max-width: 767px) {
  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .transport-options {
    grid-template-columns: repeat(2, minmax(120px, 1fr));
  }

  .map-container {
    height: 360px;
  }
}
</style>
