<script setup>
import { computed, reactive } from 'vue'
import { myFootprints } from '../data/mockData'

const filters = reactive({
  keyword: '',
  type: ''
})

const filteredData = computed(() => {
  let result = [...myFootprints]
  if (filters.keyword) {
    result = result.filter((item) =>
      item.title.toLowerCase().includes(filters.keyword.toLowerCase())
    )
  }
  if (filters.type) {
    result = result.filter((item) => item.type === filters.type)
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
          <el-breadcrumb-item>我的足迹</el-breadcrumb-item>
        </el-breadcrumb>
        <h2>浏览历史记录</h2>
      </div>
      <el-button type="danger" plain>清空历史</el-button>
    </div>

    <div class="section-card">
      <div class="filters">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索浏览记录"
          clearable
          prefix-icon="Search"
        />
        <el-select v-model="filters.type" placeholder="类型筛选" clearable>
          <el-option label="房源" value="房源" />
          <el-option label="服务" value="服务" />
          <el-option label="活动" value="活动" />
        </el-select>
      </div>

      <el-table :data="filteredData" stripe>
        <el-table-column label="图片" width="100">
          <template #default="scope">
            <el-image :src="scope.row.cover" class="thumb" fit="cover" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="240" />
        <el-table-column prop="type" label="类型" width="120" />
        <el-table-column prop="visitedAt" label="浏览时间" width="180" />
        <el-table-column label="操作" width="160">
          <template #default>
            <el-button type="primary" text size="small">查看详情</el-button>
            <el-button text size="small">删除</el-button>
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
