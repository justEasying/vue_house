<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { myAppointments } from '../data/mockData'
import { appointmentList } from '../utils/storage'

const router = useRouter()

// 使用响应式数据，从 localStorage 初始化
const listData = ref([])

// 编辑弹窗
const editVisible = ref(false)
const editForm = ref({
  id: null,
  name: '',
  phone: '',
  date: null,
  remarks: ''
})

// 初始化数据
const initData = () => {
  // 检查 localStorage 中是否已经存在数据（即使为空数组也算存在）
  const storageKey = 'my_appointment_list'
  const hasData = localStorage.getItem(storageKey) !== null
  
  if (!hasData) {
    // 只在完全首次访问时初始化 mock 数据
    setStorage(storageKey, myAppointments)
    listData.value = [...myAppointments]
  } else {
    // 如果 localStorage 中已有数据（包括空数组），直接使用
    const stored = appointmentList.getList()
    listData.value = stored
  }
}

onMounted(() => {
  initData()
})

const filters = reactive({
  keyword: '',
  status: ''
})

const filteredData = computed(() => {
  let result = [...listData.value]
  if (filters.keyword) {
    result = result.filter((item) =>
      item.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      item.name?.toLowerCase().includes(filters.keyword.toLowerCase())
    )
  }
  if (filters.status) {
    result = result.filter((item) => item.status === filters.status)
  }
  return result
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  if (typeof dateStr === 'string') return dateStr
  const d = new Date(dateStr)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 打开编辑弹窗
const openEdit = (item) => {
  editForm.value = {
    id: item.id,
    name: item.name || '',
    phone: item.phone || '',
    date: item.date ? new Date(item.date) : new Date(),
    remarks: item.remarks || ''
  }
  editVisible.value = true
}

// 关闭编辑弹窗
const closeEdit = () => {
  editVisible.value = false
  editForm.value = {
    id: null,
    name: '',
    phone: '',
    date: null,
    remarks: ''
  }
}

// 保存编辑
const saveEdit = () => {
  if (!editForm.value.name.trim()) {
    ElMessage.warning('请输入姓名')
    return
  }
  if (!editForm.value.phone.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(editForm.value.phone)) {
    ElMessage.warning('请输入正确的手机号')
    return
  }
  
  const result = appointmentList.update(editForm.value.id, {
    name: editForm.value.name,
    phone: editForm.value.phone,
    date: formatDate(editForm.value.date),
    remarks: editForm.value.remarks
  })
  
  if (result.success) {
    ElMessage.success('更新成功')
    closeEdit()
    initData()
  } else {
    ElMessage.error(result.message || '更新失败')
  }
}

// 删除预约
const handleRemove = async (id, title) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除"${title}"的预约吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = appointmentList.remove(id)
    if (result.success) {
      ElMessage.success('删除成功')
      initData()
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch {
    // 用户取消
  }
}

// 取消预约
const handleCancel = async (id, title) => {
  try {
    await ElMessageBox.confirm(
      `确定要取消"${title}"的预约吗？`,
      '取消预约确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = appointmentList.cancel(id)
    if (result.success) {
      ElMessage.success('已取消预约')
      initData()
    } else {
      ElMessage.error(result.message || '取消失败')
    }
  } catch {
    // 用户取消
  }
}

// 查看详情
const handleView = (item) => {
  if (item.type === '约看') {
    router.push(`/property/${item.propertyId || item.id}`)
  }
}

// 辅助函数：设置存储（用于初始化）
const setStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
    return true
  } catch (e) {
    console.error('保存存储数据失败:', e)
    return false
  }
}
</script>

<template>
  <div class="page-wrapper">
    <div class="page-title">
      <div>
        <el-breadcrumb separator="/">
          <el-breadcrumb-item to="/">首页</el-breadcrumb-item>
          <el-breadcrumb-item to="/my">我的</el-breadcrumb-item>
          <el-breadcrumb-item>我的约看</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>约看与报名记录</h2>
      </div>
      <el-button type="primary" plain>导出记录</el-button>
    </div>

    <div class="section-card">
      <div class="filters">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索房源 / 活动"
          clearable
          prefix-icon="Search"
        />
        <el-select v-model="filters.status" placeholder="状态筛选" clearable>
          <el-option label="待确认" value="待确认" />
          <el-option label="已确认" value="已确认" />
          <el-option label="已完成" value="已完成" />
          <el-option label="已报名" value="已报名" />
        </el-select>
      </div>

      <el-table :data="filteredData" stripe>
        <el-table-column label="图片" width="100">
          <template #default="scope">
            <el-image :src="scope.row.cover" class="thumb" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="220" />
        <el-table-column prop="type" label="类型" width="110" />
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="scope">
            <el-tag
              :type="scope.row.status === '已确认' || scope.row.status === '已报名' ? 'success' : 'info'"
            >
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="scope">
            <el-space>
              <el-button type="primary" text size="small" @click="handleView(scope.row)">
                查看详情
              </el-button>
              <el-button 
                v-if="scope.row.type === '约看' && scope.row.status !== '已取消'" 
                text 
                size="small" 
                @click="openEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                v-if="scope.row.status !== '已取消' && scope.row.status !== '已完成'" 
                text 
                size="small"
                type="warning"
                @click="handleCancel(scope.row.id, scope.row.title)"
              >
                取消
              </el-button>
              <el-button 
                type="danger" 
                text 
                size="small" 
                @click="handleRemove(scope.row.id, scope.row.title)"
              >
                删除
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑预约弹窗 -->
    <el-dialog
      v-model="editVisible"
      title="编辑预约信息"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form :model="editForm" label-width="100px">
        <el-form-item label="姓名">
          <el-input v-model="editForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="editForm.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="editForm.date"
            type="date"
            placeholder="选择预约日期"
            style="width: 100%"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="备注信息">
          <el-input
            v-model="editForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="closeEdit">取消</el-button>
        <el-button type="primary" @click="saveEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.page-wrapper {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.filters {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.thumb {
  width: 84px;
  height: 56px;
  border-radius: var(--border-radius-sm);
}

@media (max-width: 991px) {
  .filters {
    flex-direction: column;
  }
}
</style>
