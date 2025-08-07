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
  axios.post("/server/insert_aqr")
})
</script>

<template>
  <nav id="nav">
    <router-link to="/">主页</router-link>
    <router-link to="/about">关于/联系站长</router-link>
    <hr/>
  </nav>
  <div id="top-wrap">
    <router-link class="cover" to="/">
<!--      <h1 style="font-weight: bold;font-size: 5rem;font-family: 'Monotype Corsiva'">OurForum</h1>-->
      <img class="logo" src="/f.png" alt="title"/>
    </router-link>
    <!--    展示访问量-->
    <p style="position:absolute;right:1rem;top:0.3rem">访问量：{{ aqr }}</p>
    <!--    <a href="https://vuejs.org/" target="_blank">
          <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
        </a>-->
  </div>
  <h1>Say What You Want to Say</h1>
  <router-view :key="$route.fullPath"/>
</template>

<style scoped>
#nav {
  width: 90%;
  text-align: left;
  position: absolute;
  top: 0.5rem;
}
#nav a {
  font-size:1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-left: 1rem;
  margin-right: 1rem;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

.logo {
  height: 4rem;
  margin:0.5rem;
  /*will-change: filter;
  transition: filter 300ms;*/
}

h1 {
  margin-top: -0.5rem;
  font-size: 2.5rem;
}

/*
.logo:hover {
  filter: drop-shadow(0 0 2em darkgray);
}*/

/*.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}*/
</style>
