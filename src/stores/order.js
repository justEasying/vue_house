import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useOrderStore = defineStore(
  'order',
  () => {
    // 订单列表
    const orders = ref([])

    // 添加订单
    const addOrder = (orderData) => {
      const order = {
        id: 'ORD' + Date.now(),
        ...orderData,
        status: 'pending', // pending: 待确认, confirmed: 已确认, completed: 已完成, cancelled: 已取消
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      orders.value.unshift(order) // 最新订单放在前面

      // 同时存储到 localStorage（备用）
      localStorage.setItem('orders', JSON.stringify(orders.value))

      return order
    }

    // 更新订单状态
    const updateOrderStatus = (orderId, status) => {
      const order = orders.value.find(o => o.id === orderId)
      if (order) {
        order.status = status
        order.updatedAt = new Date().toISOString()

        // 更新 localStorage
        localStorage.setItem('orders', JSON.stringify(orders.value))
      }
    }

    // 取消订单
    const cancelOrder = (orderId) => {
      updateOrderStatus(orderId, 'cancelled')
    }

    // 删除订单
    const deleteOrder = (orderId) => {
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value.splice(index, 1)

        // 更新 localStorage
        localStorage.setItem('orders', JSON.stringify(orders.value))
      }
    }

    // 从 localStorage 恢复订单
    const restoreFromStorage = () => {
      try {
        const storedOrders = localStorage.getItem('orders')
        if (storedOrders) {
          orders.value = JSON.parse(storedOrders)
        }
      } catch (error) {
        console.error('恢复订单信息失败:', error)
        orders.value = []
      }
    }

    // 清空所有订单
    const clearOrders = () => {
      orders.value = []
      localStorage.removeItem('orders')
    }

    // 获取订单统计（使用 computed 实现响应式）
    const getOrderStats = computed(() => {
      return {
        total: orders.value.length,
        pending: orders.value.filter(o => o.status === 'pending').length,
        confirmed: orders.value.filter(o => o.status === 'confirmed').length,
        completed: orders.value.filter(o => o.status === 'completed').length,
        cancelled: orders.value.filter(o => o.status === 'cancelled').length
      }
    })

    return {
      orders,
      addOrder,
      updateOrderStatus,
      cancelOrder,
      deleteOrder,
      restoreFromStorage,
      clearOrders,
      getOrderStats
    }
  },
  {
    persist: {
      key: 'orders',
      storage: localStorage,
      paths: ['orders']
    }
  }
)

