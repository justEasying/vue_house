<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { myFavorites } from '../data/mockData'

const router = useRouter()

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
  let result = [...myFavorites]
  if (filters.keyword) {
    result = result.filter((item) =>
      item.title.toLowerCase().includes(filters.keyword.toLowerCase())
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

const handleBatchRemove = () => {
  if (!selectedIds.value.length) return
  selectedIds.value = []
}

const handleView = (id) => {
  router.push(`/property/${id}`)
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
              <el-button type="danger" text size="small">取消收藏</el-button>
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
