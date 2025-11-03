<script>

import axios from 'axios'
import {onMounted, ref} from "vue";

// 定义响应式数据
const articleList = ref([])

// 钩子函数
onMounted(() => {
  fetchAllArticles()
})

const  fetchAllArticles = function () {
  // 发送异步请求，获取所有文章数据
  axios.get('http://localhost:8080/article/getAll')
      .then(result => {
        articleList.value = result.data.data
      })
}

</script>

<template>

</template>

<style scoped>

</style>