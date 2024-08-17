<script setup>
import {ref, onMounted} from 'vue'
import axios from "axios";

let aqr = ref(0)
let ip = ref('')

onMounted(() => {
  // 获取访问量
  fetch('/server/get_aqr').then(res => res.json()).then(data => {
    aqr.value = data
  })
  get_ip_address()
})

async function get_ip_address() {
  await fetch('http://ip-api.com/json')
      .then(res => res.json())
      .then(data => {
        ip.value = ref(data.query).value
      })
  // 访问记录插入
  await axios.post("/server/insert_aqr")
}
</script>

<template>
  <div>
    <router-link to="/">
      <img class="logo" src="/R-C.jpg" alt="Vite logo"/>
    </router-link>
    <!--    展示访问量-->
    <p style="position:absolute;right:1.5rem;top:1.5rem">访问量：{{ aqr }}</p>
    <!--    <a href="https://vuejs.org/" target="_blank">
          <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
        </a>-->
  </div>
  <h1>Say What You Want to Say</h1>
  <router-view :key="$route.fullPath"/>
</template>

<style scoped>
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
  border-radius: 50%;
}

.logo:hover {
  filter: drop-shadow(0 0 2em goldenrod);
}

/*.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}*/
</style>
