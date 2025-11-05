<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const userStore = useUserStore()
const orderStore = useOrderStore()

// 页面加载时检查登录状态
onMounted(() => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  // orderStore 数据会通过 Pinia persist 插件自动恢复
})

// 订单状态文字和颜色映射
const statusMap = {
  pending: { label: '待确认', type: 'warning' },
  confirmed: { label: '已确认', type: 'success' },
  completed: { label: '已完成', type: 'info' },
  cancelled: { label: '已取消', type: 'danger' }
}

// 获取状态标签
const getStatusTag = (status) => {
  return statusMap[status] || { label: '未知', type: 'info' }
}

// 格式化日期时间
const formatDateTime = (isoString) => {
  const date = new Date(isoString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 取消订单
const handleCancelOrder = async (order) => {
  if (order.status === 'cancelled') {
    ElMessage.info('订单已经是取消状态')
    return
  }

  if (order.status === 'completed') {
    ElMessage.warning('已完成的订单无法取消')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要取消订单 ${order.id} 吗？`,
      '取消订单',
      {
        confirmButtonText: '确定取消',
        cancelButtonText: '我再想想',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )

    orderStore.cancelOrder(order.id)
    ElMessage.success('订单已取消')
  } catch {
    // 用户点击了取消按钮
  }
}

// 删除订单
const handleDeleteOrder = async (order) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除订单 ${order.id} 吗？删除后无法恢复。`,
      '删除订单',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    orderStore.deleteOrder(order.id)
    ElMessage.success('订单已删除')
  } catch {
    // 用户点击了取消按钮
  }
}

// 查看订单详情
const handleViewDetail = (order) => {
  ElMessage.info('订单详情功能开发中')
  console.log('订单详情:', order)
}

// 订单统计（getOrderStats 已经是 computed 属性）
const stats = computed(() => orderStore.getOrderStats)

// 过滤后的订单列表
// 添加防御性检查，确保 orders 是数组
const orderList = computed(() => {
  return Array.isArray(orderStore.orders) ? orderStore.orders : []
})
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item to="/my">我的</el-breadcrumb-item>
          <el-breadcrumb-item>服务订单</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>服务订单管理</h2>
      </div>
      <div class="stats-bar">
        <el-tag size="large">全部 {{ stats.total }}</el-tag>
        <el-tag size="large" type="warning">待确认 {{ stats.pending }}</el-tag>
        <el-tag size="large" type="success">已确认 {{ stats.confirmed }}</el-tag>
        <el-tag size="large" type="info">已完成 {{ stats.completed }}</el-tag>
        <el-tag size="large" type="danger">已取消 {{ stats.cancelled }}</el-tag>
      </div>
    </div>

    <div v-if="orderList.length === 0" class="section-card">
      <el-empty description="暂无服务订单">
        <el-button type="primary" @click="router.push('/service')">
          立即预约服务
        </el-button>
      </el-empty>
    </div>

    <div v-else class="order-list">
      <div v-for="order in orderList" :key="order.id" class="section-card order-card">
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">订单号：{{ order.id }}</span>
            <span class="order-time">创建时间：{{ formatDateTime(order.createdAt) }}</span>
          </div>
          <el-tag :type="getStatusTag(order.status).type" size="large">
            {{ getStatusTag(order.status).label }}
          </el-tag>
        </div>

        <div class="order-content">
          <div class="order-service">
            <el-image
              :src="order.serviceCover"
              class="service-cover"
              fit="cover"
              :lazy="true"
            >
              <template #error>
                <div class="image-slot">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="service-info">
              <h3>{{ order.serviceTitle }}</h3>
              <p class="package-info">
                <el-tag size="small" type="primary">{{ order.packageName }}</el-tag>
                <span class="price">¥{{ order.packagePrice }}</span>
              </p>
              <div class="service-details">
                <p><el-icon><Calendar /></el-icon> 预约时间：{{ order.date }} {{ order.time }}</p>
                <p><el-icon><Location /></el-icon> 服务地址：{{ order.address }}</p>
                <p><el-icon><User /></el-icon> 联系人：{{ order.contact }} {{ order.phone }}</p>
                <p v-if="order.remark">
                  <el-icon><ChatLineSquare /></el-icon> 备注：{{ order.remark }}
                </p>
              </div>
            </div>
          </div>

          <div class="order-actions">
            <el-button
              v-if="order.status === 'pending' || order.status === 'confirmed'"
              type="danger"
              plain
              @click="handleCancelOrder(order)"
            >
              取消订单
            </el-button>
            <el-button
              v-if="order.status === 'cancelled' || order.status === 'completed'"
              type="danger"
              text
              @click="handleDeleteOrder(order)"
            >
              删除订单
            </el-button>
            <el-button type="primary" plain @click="handleViewDetail(order)">
              查看详情
            </el-button>
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
  gap: var(--spacing-2xl);
}

.stats-bar {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.order-card {
  transition: var(--transition-base);
}

.order-card:hover {
  box-shadow: var(--shadow-lg);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  margin-bottom: var(--spacing-lg);
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.order-id {
  font-weight: var(--font-weight-semibold);
  color: var(--gray-1);
  font-size: var(--font-size-md);
}

.order-time {
  color: var(--gray-3);
  font-size: var(--font-size-sm);
}

.order-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.order-service {
  display: flex;
  gap: var(--spacing-lg);
}

.service-cover {
  width: 160px;
  height: 120px;
  border-radius: var(--border-radius-md);
  flex-shrink: 0;
  overflow: hidden;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--gray-7);
  color: var(--gray-4);
  font-size: var(--font-size-5xl);
}

.service-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.service-info h3 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--gray-1);
  font-weight: var(--font-weight-semibold);
}

.package-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin: 0;
}

.price {
  color: var(--brand-danger);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.service-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  color: var(--gray-2);
  font-size: var(--font-size-sm);
}

.service-details p {
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.service-details .el-icon {
  color: var(--brand-primary);
  font-size: var(--font-size-md);
}

.order-actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

@media (max-width: 767px) {
  .stats-bar {
    gap: var(--spacing-sm);
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }

  .order-service {
    flex-direction: column;
  }

  .service-cover {
    width: 100%;
    height: 180px;
  }

  .order-actions {
    flex-direction: column;
  }

  .order-actions .el-button {
    width: 100%;
  }
}
</style>

