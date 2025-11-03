<script setup>
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { serviceDetail } from '../data/mockData'

const detail = serviceDetail
const selectedPackageId = ref(detail.packages[1]?.id ?? detail.packages[0].id)
const activeTab = ref('intro')

const bookingForm = reactive({
  packageId: selectedPackageId.value,
  date: '',
  time: '',
  address: '',
  contact: '',
  phone: '',
  remark: ''
})

const bookingRules = {
  date: [{ required: true, message: '请选择预约日期', trigger: 'change' }],
  time: [{ required: true, message: '请选择预约时间段', trigger: 'change' }],
  address: [{ required: true, message: '请填写服务地址', trigger: 'blur' }],
  contact: [{ required: true, message: '请填写联系人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请填写联系电话', trigger: 'blur' },
    {
      pattern: /^1\d{10}$/,
      message: '请输入正确的手机号',
      trigger: ['blur', 'change']
    }
  ]
}

const availableTimes = [
  '09:00-11:00',
  '11:30-13:30',
  '14:00-16:00',
  '16:30-18:30',
  '19:00-21:00'
]

const bookingFormRef = ref()

const selectedPackage = computed(() =>
  detail.packages.find((item) => item.id === selectedPackageId.value)
)

const handlePackageSelect = (id) => {
  selectedPackageId.value = id
  bookingForm.packageId = id
}

const handleSubmit = async () => {
  if (!bookingFormRef.value) return
  const valid = await bookingFormRef.value.validate().catch(() => false)
  if (!valid) return
  ElMessage.success('预约提交成功，客服将尽快与您确认。')
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item to="/service">服务</el-breadcrumb-item>
          <el-breadcrumb-item>服务详情</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>{{ detail.title }}</h2>
      </div>
      <el-tag type="success" effect="dark">
        累计预约 {{ detail.appointmentCount }} 次 · 评分 {{ detail.rating }}
      </el-tag>
    </div>

    <div class="detail-layout">
      <div class="detail-main">
        <div class="section-card hero-card">
          <img :src="detail.cover" alt="" class="hero-img" />
          <div class="hero-info">
            <div class="hero-meta">
              <el-tag effect="dark" type="primary">{{ detail.duration }}</el-tag>
              <el-tag effect="dark" type="warning">￥{{ detail.price }}</el-tag>
            </div>
            <p>{{ detail.description }}</p>
            <el-steps :active="3" align-center class="steps">
              <el-step title="提交预约" description="选择套餐、时间段" />
              <el-step title="客服确认" description="与您沟通具体安排" />
              <el-step title="上门服务" description="师傅准时到达" />
              <el-step title="评价反馈" description="完成支付与评价" />
            </el-steps>
          </div>
        </div>

        <div class="section-card">
          <div class="section-card__header">
            <span class="section-card__title">服务套餐选择</span>
            <el-text type="info">满足不同房型与家庭需求，支持升级加时</el-text>
          </div>
          <div class="package-grid">
            <el-card
              v-for="pkg in detail.packages"
              :key="pkg.id"
              class="package-card"
              :class="{ 'is-active': selectedPackageId === pkg.id }"
              shadow="hover"
              @click="handlePackageSelect(pkg.id)"
            >
              <div class="package-head">
                <h4>{{ pkg.name }}</h4>
                <el-tag effect="dark" type="primary">￥{{ pkg.price }}</el-tag>
              </div>
              <p class="package-desc">{{ pkg.desc }}</p>
              <ul>
                <li v-for="perk in pkg.perks" :key="perk">
                  <el-icon><SuccessFilled /></el-icon>
                  {{ perk }}
                </li>
              </ul>
              <el-button
                type="primary"
                plain
                :disabled="selectedPackageId === pkg.id"
              >
                {{ selectedPackageId === pkg.id ? '当前已选' : '选择套餐' }}
              </el-button>
            </el-card>
          </div>
        </div>

        <div class="section-card">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="服务介绍" name="intro">
              <p class="tab-text">
                {{ detail.description }}
              </p>
              <el-alert
                type="info"
                :closable="false"
                show-icon
                title="为保障服务质量，我们选用专业保洁工具与环保清洁剂，并针对重点区域采用蒸汽、除螨等深度方式。"
              />
            </el-tab-pane>
            <el-tab-pane label="服务须知" name="notice">
              <ul class="notice-list">
                <li v-for="item in detail.notice" :key="item">
                  <el-icon><InfoFilled /></el-icon>
                  {{ item }}
                </li>
              </ul>
            </el-tab-pane>
            <el-tab-pane label="用户评价" name="reviews">
              <el-empty v-if="!detail.reviews.length" description="暂无评价，欢迎预约体验后分享感受" />
              <el-card
                v-for="review in detail.reviews"
                :key="review.id"
                class="review-card"
                shadow="never"
              >
                <div class="review-head">
                  <el-avatar :src="review.avatar" />
                  <div>
                    <strong>{{ review.user }}</strong>
                    <p>{{ review.date }}</p>
                  </div>
                  <el-rate :model-value="review.rate" disabled size="small" />
                </div>
                <p>{{ review.comment }}</p>
              </el-card>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <div class="detail-side">
        <div class="section-card booking-card">
          <div class="section-card__header">
            <span class="section-card__title">预约服务</span>
            <el-text type="info">选择时间与填写联系方式，客服将在 10 分钟内响应</el-text>
          </div>
          <el-form
            ref="bookingFormRef"
            :model="bookingForm"
            :rules="bookingRules"
            label-position="top"
            class="booking-form"
          >
            <el-form-item label="服务套餐">
              <el-select v-model="bookingForm.packageId" size="large">
                <el-option
                  v-for="pkg in detail.packages"
                  :key="pkg.id"
                  :label="`${pkg.name} ￥${pkg.price}`"
                  :value="pkg.id"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="预约日期" prop="date">
              <el-date-picker
                v-model="bookingForm.date"
                type="date"
                placeholder="请选择日期"
                size="large"
                value-format="YYYY-MM-DD"
                :disabled-date="(time) => time.getTime() < Date.now() - 86400000"
              />
            </el-form-item>
            <el-form-item label="预约时间段" prop="time">
              <el-select v-model="bookingForm.time" size="large" placeholder="请选择时间段">
                <el-option v-for="time in availableTimes" :key="time" :label="time" :value="time" />
              </el-select>
            </el-form-item>
            <el-form-item label="服务地址" prop="address">
              <el-input
                v-model="bookingForm.address"
                type="textarea"
                rows="2"
                placeholder="请填写详细地址（需包含门牌号或楼栋信息）"
              />
            </el-form-item>
            <el-form-item label="联系人姓名" prop="contact">
              <el-input v-model="bookingForm.contact" placeholder="请输入联系人姓名" />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="bookingForm.phone" placeholder="11 位手机号" />
            </el-form-item>
            <el-form-item label="备注信息">
              <el-input
                v-model="bookingForm.remark"
                type="textarea"
                rows="2"
                placeholder="如有特殊清洁需求请在此说明"
              />
            </el-form-item>
            <el-button type="primary" size="large" block @click="handleSubmit">
              提交预约
            </el-button>
          </el-form>
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

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(300px, 2fr);
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

.hero-card {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
}

.hero-img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: var(--border-radius-lg);
}

.hero-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.steps {
  margin-top: 8px;
}

.package-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.package-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  cursor: pointer;
  transition: var(--transition-base);
}

.package-card.is-active {
  border: 1px solid rgba(47, 84, 235, 0.35);
  box-shadow: 0 12px 32px rgba(47, 84, 235, 0.25);
}

.package-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.package-head h4 {
  margin: 0;
  font-size: 18px;
  color: var(--gray-1);
}

.package-desc {
  margin: 0;
  color: var(--gray-3);
}

.package-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--gray-2);
}

.package-card li {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.tab-text {
  margin: 0 0 16px;
  color: var(--gray-2);
  line-height: 1.8;
}

.notice-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--gray-2);
}

.notice-list li {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.review-card {
  margin-bottom: 12px;
}

.review-head {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-head strong {
  display: block;
  font-size: 15px;
}

.review-head p {
  margin: 2px 0 0;
  color: var(--gray-4);
  font-size: 12px;
}

.booking-card {
  position: sticky;
  top: 88px;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 1399px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .booking-card {
    position: relative;
    top: auto;
  }
}

@media (max-width: 991px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .hero-img {
    height: 220px;
  }
}
</style>
