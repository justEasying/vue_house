<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { myFavorites } from '../data/mockData'
import { wantList } from '../utils/storage'

const router = useRouter()

// 使用响应式数据，从 localStorage 初始化
const listData = ref([])

// 初始化数据
const initData = () => {
  // 检查 localStorage 中是否已经存在数据（即使为空数组也算存在）
  const storageKey = 'my_want_list'
  const hasData = localStorage.getItem(storageKey) !== null
  
  if (!hasData) {
    // 只在完全首次访问时初始化 mock 数据
    setStorage(storageKey, myFavorites)
    listData.value = [...myFavorites]
  } else {
    // 如果 localStorage 中已有数据（包括空数组），直接使用
    const stored = wantList.getList()
    listData.value = stored
  }
}

onMounted(() => {
  initData()
})

const filters = reactive({
  keyword: '',
  layout: '',
  priceOrder: ''
})

const pageState = reactive({
  currentPage: 1,
  pageSize: 5
})

const selectedIds = ref([])

const filteredData = computed(() => {
  let result = [...listData.value]
  if (filters.keyword) {
    result = result.filter((item) =>
      item.title.toLowerCase().includes(filters.keyword.toLowerCase()) ||
      item.address?.toLowerCase().includes(filters.keyword.toLowerCase())
    )
  }
  if (filters.layout) {
    result = result.filter((item) => item.layout.includes(filters.layout))
  }
  if (filters.priceOrder) {
    const multiplier = filters.priceOrder === 'asc' ? 1 : -1
    result = result.sort((a, b) => (a.price - b.price) * multiplier)
  }
  return result
})

const paginatedData = computed(() => {
  const start = (pageState.currentPage - 1) * pageState.pageSize
  return filteredData.value.slice(start, start + pageState.pageSize)
})

const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id)
}

// 批量删除
const handleBatchRemove = async () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请先选择要删除的房源')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个房源吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = wantList.removeBatch(selectedIds.value)
    if (result.success) {
      ElMessage.success(`成功删除 ${result.count} 个房源`)
      selectedIds.value = []
      initData() // 重新加载数据
      // 如果当前页没有数据了，回到上一页
      if (paginatedData.value.length === 0 && pageState.currentPage > 1) {
        pageState.currentPage--
      }
    }
  } catch {
    // 用户取消
  }
}

// 单个删除
const handleRemove = async (id, title) => {
  try {
    await ElMessageBox.confirm(
      `确定要从想看列表中移除"${title}"吗？`,
      '取消收藏确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = wantList.remove(id)
    if (result.success) {
      ElMessage.success('已取消收藏')
      initData() // 重新加载数据
      // 如果当前页没有数据了，回到上一页
      if (paginatedData.value.length === 0 && pageState.currentPage > 1) {
        pageState.currentPage--
      }
    } else {
      ElMessage.error(result.message || '删除失败')
    }
  } catch {
    // 用户取消
  }
}

const handleView = (id) => {
  router.push(`/property/${id}`)
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
          <el-breadcrumb-item>我的想看</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>我的想看房源列表</h2>
      </div>
      <el-button type="primary" plain :disabled="!selectedIds.length" @click="handleBatchRemove">
        批量取消收藏
      </el-button>
    </div>

    <div class="section-card">
      <div class="filters">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索房源标题或地址"
          clearable
          prefix-icon="Search"
        />
        <el-select v-model="filters.layout" placeholder="户型筛选" clearable>
          <el-option label="一居" value="1室" />
          <el-option label="两居" value="2室" />
          <el-option label="三居" value="3室" />
        </el-select>
        <el-select v-model="filters.priceOrder" placeholder="价格排序" clearable>
          <el-option label="价格从低到高" value="asc" />
          <el-option label="价格从高到低" value="desc" />
        </el-select>
      </div>

      <el-table
        :data="paginatedData"
        stripe
        @selection-change="handleSelectionChange"
        style="width: 100%"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="图片" width="100">
          <template #default="scope">
            <el-image :src="scope.row.cover" class="thumb" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column label="标题" min-width="200">
          <template #default="scope">
            <div class="title-cell">
              <el-button type="primary" link @click="handleView(scope.row.id)">
                {{ scope.row.title }}
              </el-button>
              <span>{{ scope.row.address }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="价格" width="120">
          <template #default="scope">
            <strong class="price">{{ scope.row.price }} 元/月</strong>
          </template>
        </el-table-column>
        <el-table-column prop="layout" label="户型" width="100" />
        <el-table-column prop="size" label="面积㎡" width="100" />
        <el-table-column prop="favoriteAt" label="收藏时间" width="160" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-space>
              <el-button type="primary" text size="small" @click="handleView(scope.row.id)">
                查看详情
              </el-button>
              <el-button type="danger" text size="small" @click="handleRemove(scope.row.id, scope.row.title)">
                取消收藏
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          v-model:current-page="pageState.currentPage"
          v-model:page-size="pageState.pageSize"
          :page-sizes="[5, 10, 15]"
          layout="total, sizes, prev, pager, next"
          :total="filteredData.length"
        />
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

.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-cell span {
  font-size: 12px;
  color: var(--gray-4);
}

.price {
  color: var(--brand-primary);
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 991px) {
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
