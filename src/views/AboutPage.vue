<script setup>
import { ref, onMounted, onUnmounted } from "vue";

// 示例：计算当前时间到2024年2月4日20:14:18的时间差
const result = ref("");
let timer = ref();

onMounted(() => {
  timeDifference()
  timer.value = setInterval(timeDifference, 1000)
})

onUnmounted(() => {
  clearInterval(timer.value)
  timer.value = ""
})

function timeDifference() {
  const targetDate = "2024-02-04T20:14:18"; // ISO格式
  // 获取当前时间
  const now = new Date();
  // 将目标时间转换为Date对象
  const target = new Date(targetDate);

  // 计算时间差（以毫秒为单位）
  const diff = now - target;

  // 如果目标时间早于当前时间，返回提示信息
  if (diff < 0) {
    return "目标时间已过期";
  }

  // 将时间差转换为天、小时、分钟和秒
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  // 格式化输出
  result.value = `${days}天:${String(hours).padStart(2, '0')}小时:${String(minutes).padStart(2, '0')}分钟:${String(seconds).padStart(2, '0')}秒`;
  console.log(result.value)
}

</script>

<template>
  <div>
    <h2>联系站长</h2>
    <p style="font-size:1.3rem;font-weight:bold;">QQ:1915741816</p>
    <p style="font-size:1.3rem;font-weight: bold">邮箱：public_mail_asdf@163.com</p>
  </div>
  <div>
    <p>简单介绍一下，这个网站是当时一个初中生（现在为高中生）练习编程的一个实操项目</p>
    <p>学编程后一直梦想着自己的网站能被别人看到</p>
    <p>目前已经运行了约<span style="color:red;">{{ result }}</span></p>
  </div>
</template>

<style scoped></style>