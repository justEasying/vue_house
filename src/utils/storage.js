// 本地存储管理工具
const STORAGE_KEYS = {
  MY_WANT: 'my_want_list',
  MY_APPOINTMENT: 'my_appointment_list'
}

// 获取存储数据
export const getStorage = (key) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error('获取存储数据失败:', e)
    return []
  }
}

// 设置存储数据
export const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('保存存储数据失败:', e)
    return false
  }
}

// 我的想看相关操作
export const wantList = {
  // 获取列表
  getList: () => getStorage(STORAGE_KEYS.MY_WANT),
  
  // 添加
  add: (item) => {
    const list = wantList.getList()
    // 检查是否已存在
    if (list.find(i => i.id === item.id)) {
      return { success: false, message: '该房源已在想看列表中' }
    }
    const newItem = {
      ...item,
      favoriteAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-')
    }
    list.unshift(newItem)
    setStorage(STORAGE_KEYS.MY_WANT, list)
    return { success: true, data: newItem }
  },
  
  // 删除
  remove: (id) => {
    const list = wantList.getList()
    const index = list.findIndex(i => i.id === id)
    if (index === -1) {
      return { success: false, message: '未找到该房源' }
    }
    list.splice(index, 1)
    setStorage(STORAGE_KEYS.MY_WANT, list)
    return { success: true }
  },
  
  // 批量删除
  removeBatch: (ids) => {
    const list = wantList.getList()
    const newList = list.filter(i => !ids.includes(i.id))
    setStorage(STORAGE_KEYS.MY_WANT, newList)
    return { success: true, count: list.length - newList.length }
  },
  
  // 检查是否存在
  has: (id) => {
    const list = wantList.getList()
    return list.some(i => i.id === id)
  }
}

// 我的约看相关操作
export const appointmentList = {
  // 获取列表
  getList: () => getStorage(STORAGE_KEYS.MY_APPOINTMENT),
  
  // 添加
  add: (appointment) => {
    const list = appointmentList.getList()
    const newItem = {
      id: Date.now(),
      ...appointment,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(/\//g, '-'),
      status: '待确认'
    }
    list.unshift(newItem)
    setStorage(STORAGE_KEYS.MY_APPOINTMENT, list)
    return { success: true, data: newItem }
  },
  
  // 更新
  update: (id, updates) => {
    const list = appointmentList.getList()
    const index = list.findIndex(i => i.id === id)
    if (index === -1) {
      return { success: false, message: '未找到该预约' }
    }
    list[index] = { ...list[index], ...updates }
    setStorage(STORAGE_KEYS.MY_APPOINTMENT, list)
    return { success: true, data: list[index] }
  },
  
  // 删除
  remove: (id) => {
    const list = appointmentList.getList()
    const index = list.findIndex(i => i.id === id)
    if (index === -1) {
      return { success: false, message: '未找到该预约' }
    }
    list.splice(index, 1)
    setStorage(STORAGE_KEYS.MY_APPOINTMENT, list)
    return { success: true }
  },
  
  // 取消预约
  cancel: (id) => {
    return appointmentList.update(id, { status: '已取消' })
  }
}

