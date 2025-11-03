<script setup>
import { computed, reactive } from 'vue'
import { myAppointments } from '../data/mockData'

const filters = reactive({
  keyword: '',
  status: ''
})

const filteredData = computed(() => {
  let result = [...myAppointments]
  if (filters.keyword) {
    result = result.filter((item) =>
      item.title.toLowerCase().includes(filters.keyword.toLowerCase())
    )
  }
  if (filters.status) {
    result = result.filter((item) => item.status === filters.status)
  }
  return result
})
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
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button type="primary" text size="small">查看详情</el-button>
            <el-button text size="small">取消</el-button>
          </template>
        </el-table-column>
      </el-table>
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

@media (max-width: 991px) {
  .filters {
    flex-direction: column;
  }
}
</style>
