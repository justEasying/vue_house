<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { mapBoundary, propertyDetail } from '../data/mockData'
import { wantList, appointmentList } from '../utils/storage'

const router = useRouter()
const detail = propertyDetail

// 检查是否已在想看列表
const isInWantList = ref(false)

// 检查是否已收藏
const checkWantStatus = () => {
  isInWantList.value = wantList.has(detail.id)
}

onMounted(() => {
  checkWantStatus()
})

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

// 加入想看
const handleAddToWant = () => {
  if (isInWantList.value) {
    ElMessage.warning('该房源已在想看列表中')
    return
  }
  
  const propertyData = {
    id: detail.id,
    title: detail.title,
    price: detail.price,
    layout: detail.layout,
    size: detail.area,
    address: detail.address || '朝阳区 · 国贸',
    cover: detail.gallery?.[0] || 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=240&q=80'
  }
  
  const result = wantList.add(propertyData)
  if (result.success) {
    ElMessage.success('已添加到想看列表')
    isInWantList.value = true
  } else {
    ElMessage.warning(result.message || '添加失败')
  }
}

// 预约看房相关
const appointmentVisible = ref(false)
const appointmentForm = ref({
  name: '',
  phone: '',
  date: new Date(),
  remarks: ''
})

const datePickerVisible = ref(false)

// 格式化日期
const formatDate = (date) => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取星期几
const getWeekday = (date) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  return weekdays[new Date(date).getDay()]
}

// 判断是否是今天
const isToday = (date) => {
  const today = new Date()
  const d = new Date(date)
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
}

// 获取可选日期列表（未来7天）
const availableDates = computed(() => {
  const dates = []
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    dates.push(date)
  }
  return dates
})

// 显示日期选择器
const showDatePicker = () => {
  datePickerVisible.value = !datePickerVisible.value
}

// 选择日期
const selectDate = (date) => {
  appointmentForm.value.date = date
  datePickerVisible.value = false
}

// 打开预约弹窗
const openAppointment = () => {
  appointmentVisible.value = true
  appointmentForm.value = {
    name: '',
    phone: '',
    date: new Date(),
    remarks: ''
  }
  datePickerVisible.value = false
}

// 关闭预约弹窗
const closeAppointment = () => {
  appointmentVisible.value = false
  datePickerVisible.value = false
}

// 提交预约
const submitAppointment = () => {
  // 表单验证
  if (!appointmentForm.value.name.trim()) {
    ElMessage.warning('请输入姓名')
    return
  }
  if (!appointmentForm.value.phone.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }
  // 简单的手机号验证
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(appointmentForm.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  if (!appointmentForm.value.date) {
    ElMessage.warning('请选择预约日期')
    return
  }

  // 保存到约看列表
  const appointmentData = {
    title: detail.title,
    type: '约看',
    time: formatDate(appointmentForm.value.date) + ' 全天随时可看',
    status: '待确认',
    cover: detail.gallery?.[0] || 'https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=240&q=80',
    propertyId: detail.id,
    name: appointmentForm.value.name,
    phone: appointmentForm.value.phone,
    date: formatDate(appointmentForm.value.date),
    remarks: appointmentForm.value.remarks
  }
  
  const result = appointmentList.add(appointmentData)
  if (result.success) {
    ElMessage.success('预约成功！我们会在预约时间前联系您')
    closeAppointment()
    
    // 可以跳转到预约列表
    setTimeout(() => {
      router.push('/my/appointment')
    }, 1500)
  } else {
    ElMessage.error('预约失败，请重试')
  }
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
              <el-button type="primary" size="large" @click="openAppointment">预约看房</el-button>
              <el-button 
                size="large" 
                :plain="!isInWantList"
                :type="isInWantList ? 'success' : 'default'"
                @click="handleAddToWant"
              >
                <el-icon v-if="isInWantList"><CircleCheck /></el-icon>
                {{ isInWantList ? '已在想看' : '加入想看' }}
              </el-button>
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

    <!-- 预约看房底部弹窗 -->
    <el-drawer
      v-model="appointmentVisible"
      :with-header="false"
      direction="btt"
      size="70%"
      class="appointment-drawer"
      :close-on-click-modal="true"
    >
      <div class="appointment-modal">
        <h2 class="appointment-title">预约信息</h2>
        
        <div class="appointment-form">
          <!-- 姓名 -->
          <div class="form-item">
            <label class="form-label">姓名</label>
            <el-input
              v-model="appointmentForm.name"
              placeholder="请输入姓名"
              class="form-input"
              clearable
            />
          </div>

          <!-- 手机号 -->
          <div class="form-item">
            <label class="form-label">手机号</label>
            <el-input
              v-model="appointmentForm.phone"
              placeholder="请输入手机号"
              class="form-input"
              maxlength="11"
              clearable
            />
          </div>

          <!-- 预约日期 -->
          <div class="form-item">
            <label class="form-label">预约日期</label>
            <div class="date-selector" @click="showDatePicker">
              <span class="date-display">
                {{ formatDate(appointmentForm.date) }}
                <span v-if="isToday(appointmentForm.date)" class="today-label">(今天)</span>
              </span>
              <el-icon class="date-arrow" :class="{ 'is-open': datePickerVisible }">
                <ArrowDown />
              </el-icon>
            </div>
            
            <!-- 日期选择网格 -->
            <div v-if="datePickerVisible" class="date-grid">
              <div
                v-for="date in availableDates"
                :key="date.getTime()"
                class="date-item"
                :class="{ active: formatDate(date) === formatDate(appointmentForm.date) }"
                @click="selectDate(date)"
              >
                <span class="date-weekday">{{ isToday(date) ? '(今天)' : `(${getWeekday(date)})` }}</span>
                <span class="date-value">{{ formatDate(date) }}</span>
              </div>
            </div>
          </div>

          <!-- 备注信息 -->
          <div class="form-item">
            <label class="form-label">备注信息</label>
            <el-input
              v-model="appointmentForm.remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
              class="form-input"
              maxlength="200"
              show-word-limit
            />
          </div>
        </div>

        <!-- 提交按钮 -->
        <div class="appointment-actions">
          <el-button type="primary" size="large" class="submit-btn" @click="submitAppointment">
            预约看房
          </el-button>
        </div>
      </div>
    </el-drawer>
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

/* 预约看房弹窗样式 */
.appointment-drawer :deep(.el-drawer__body) {
  padding: 0;
}

.appointment-modal {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.appointment-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--gray-1);
  margin: 0 0 24px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color-light);
}

.appointment-form {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  color: var(--gray-2);
  font-weight: 500;
}

.form-input {
  width: 100%;
}

/* 日期选择器样式 */
.date-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: var(--gray-bg-light);
  border-radius: var(--border-radius-sm);
  cursor: pointer;
  transition: var(--transition-fast);
  border: 1px solid var(--border-color-light);
}

.date-selector:hover {
  border-color: var(--border-color);
  background-color: var(--color-white);
}

.date-display {
  font-size: 14px;
  color: var(--gray-1);
  display: flex;
  align-items: center;
  gap: 8px;
}

.today-label {
  color: var(--brand-primary);
  font-size: 12px;
}

.date-arrow {
  font-size: 16px;
  color: var(--gray-3);
  transition: transform 0.3s;
}

.date-arrow.is-open {
  transform: rotate(180deg);
}

/* 日期网格 */
.date-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 12px;
  padding: 12px;
  background-color: var(--gray-bg-light);
  border-radius: var(--border-radius-sm);
}

.date-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border-radius: var(--border-radius-sm);
  border: 1px solid var(--border-color-light);
  background-color: var(--color-white);
  cursor: pointer;
  transition: var(--transition-fast);
}

.date-item:hover {
  border-color: var(--brand-primary);
  background-color: var(--brand-primary-soft);
}

.date-item.active {
  border-color: var(--brand-primary);
  background-color: var(--brand-primary);
  color: var(--color-white);
}

.date-item.active .date-weekday,
.date-item.active .date-value {
  color: var(--color-white);
}

.date-weekday {
  font-size: 11px;
  color: var(--gray-3);
}

.date-value {
  font-size: 12px;
  color: var(--gray-1);
  font-weight: 500;
}

/* 提交按钮 */
.appointment-actions {
  padding-top: 20px;
  border-top: 1px solid var(--border-color-light);
  margin-top: auto;
}

.submit-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
}

/* 响应式调整 */
@media (max-width: 767px) {
  .appointment-modal {
    padding: 20px 16px;
  }

  .appointment-title {
    font-size: 18px;
    margin-bottom: 20px;
  }

  .date-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .form-item {
    gap: 6px;
  }
}

@media (max-width: 480px) {
  .date-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
