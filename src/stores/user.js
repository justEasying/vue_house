import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    // 用户信息
    const userInfo = ref(null)
    const token = ref('')

    // 是否已登录
    const isLoggedIn = computed(() => !!userInfo.value && !!token.value)

    // 设置用户信息
    const setUserInfo = (info) => {
      userInfo.value = info
    }

    // 设置 token
    const setToken = (newToken) => {
      token.value = newToken
    }

    // 登录
    const login = (userData, userToken) => {
      userInfo.value = userData
      token.value = userToken
      
      // 同时存储到 localStorage（备用）
      localStorage.setItem('userInfo', JSON.stringify(userData))
      localStorage.setItem('token', userToken)
    }

    // 注册（注册后自动登录）
    const register = (userData, userToken) => {
      login(userData, userToken)
    }

    // 退出登录
    const logout = () => {
      userInfo.value = null
      token.value = ''
      
      // 清理 localStorage
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
    }

    // 从 localStorage 恢复用户信息
    const restoreFromStorage = () => {
      try {
        const storedUserInfo = localStorage.getItem('userInfo')
        const storedToken = localStorage.getItem('token')
        
        if (storedUserInfo && storedToken) {
          userInfo.value = JSON.parse(storedUserInfo)
          token.value = storedToken
        }
      } catch (error) {
        console.error('恢复用户信息失败:', error)
        logout()
      }
    }

    // 更新用户信息
    const updateUserInfo = (updates) => {
      if (userInfo.value) {
        userInfo.value = { ...userInfo.value, ...updates }
        localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
      }
    }

    return {
      userInfo,
      token,
      isLoggedIn,
      setUserInfo,
      setToken,
      login,
      register,
      logout,
      restoreFromStorage,
      updateUserInfo
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'user',
          storage: localStorage,
          paths: ['userInfo', 'token']
        }
      ]
    }
  }
)

