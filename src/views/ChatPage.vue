<script setup>
import {onMounted, onUnmounted, ref, toRefs} from 'vue'
import axios from "axios";
import {useRouter} from "vue-router";
// localStorage设置失效时间
import {store} from 'xijs';
import CryptoJS from 'crypto-js'
import * as imageConversion from 'image-conversion';


const route = useRouter();

// 获取路由参数
const props = defineProps({
  page_name: String,
  database: String,
  type_: Number,
  enterpass: String,
  sendpass: String
})
const {page_name} = toRefs(props)
const {database} = toRefs(props)
const {type_} = toRefs(props)
const {enterpass} = toRefs(props)
const {sendpass} = toRefs(props)

// submit所用数据
let user = ref({
  chatroom: page_name.value,
  sender: "",
  content: "",
  imgSrc: [],
  type: 0,
  ip: "",
  address: "",
})

let upload = ref()

// 定义变量
let messageList = ref([])
let pass = ref('')
let choose = ref(false)
// 公告密码
let notice_pass = ref('')
// limit
let get_arg = ref({
  get_count: 10,
  type: 0,
  chatroom: page_name.value,
})
let ip_blacklist = ref([])

// 进入时执行
onMounted(() => {
  start_1()
  start()
})

async function start_1() {
  if (type_.value === 1) {
    // 同步执行
    // 判断之前是否有进入密码的存储
    if (store.get(page_name.value).value !== 'ok') {
      let input = prompt("请输入进入密码：")
      if (CryptoJS.SHA256(input).toString() === enterpass.value) {
        // 设置进入密码localStorage，三天失效
        await store.set(page_name.value, 'ok', Date.now() + 1000 * 60 * 60 * 24 * 3)
        start()
      } else {
        alert('即将跳转主页')
        await route.push('/')
      }
    }
  }
}

function start() {
  get_notice_pass()
  get_ip_blacklist()
  get_message(2)
  get_ip_address()
  window.addEventListener('scroll', get_more);
}

onUnmounted(() => {
  window.removeEventListener('scroll', get_more);
})

function test() {
}

test()

async function get_ip_address() {
  await fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => {
        user.value.ip = ref(data.ip).value
      })
  fetch('https://www.fkcoder.com/ip?ip=' + user.value.ip)
      .then(res => res.json())
      .then(data => {
        user.value.address = ref(data['country'] + ' ' + data['province'] + ' ' + data['city']).value
      })
}

function get_ip_blacklist() {
  axios.post("/server/get_all", {'table': 'ipblacklist'}).then(response => {
    ip_blacklist.value = ref(response.data).value
  })
}

function get_message(type) {
  get_arg.value.type = type
  axios.post("/server/get_message", get_arg.value).then(response => {
    // res.value = ref(response["data"]).value
    // 获取数据并插入res中
    // 图片数据处理，将图片数据分割为数组
    for (let i = 0; i < response.data.length; i++) {
      response.data[i][4] = String(response.data[i][4]).split(',');
    }
    if (type === 2) {
      messageList.value = ref(response.data).value
      return
    }
    messageList.value = messageList.value.concat(ref(response.data).value)
  })
}

function get_notice_pass() {
  axios.post("/server/get_pass", {passtype: 'send_notice'}).then(response => {
    notice_pass.value = ref(response.data[0][1]).value
  })
}

function get_notice() {
  axios.post("/server/get_notice", get_arg.value).then(response => {
    // 预处理数据
    for (let i = 0; i < response.data.length; i++) {
      response.data[i][4] = String(response.data[i][4]).split(',');
    }
    messageList.value = ref(response.data).value
    // 反转数组，在最上层显示最新数据
    messageList.value.reverse()
  })
}

//方法一：直接将图片压缩到指定kb值
function uploadContractFun(file) {
  //项目要求是大于1MB的图片进行压缩，可根据项目情况自行判断
  if (file.size > 1024 * 1024) {
    // console.log('压缩前', file) // 压缩到400KB
    imageConversion.compressAccurately(file.raw, 400).then(res => {
      // console.log('压缩后', res) // 压缩后是一个blob对象
      return res
    })
  }
  return file.raw
}

async function handleChange(file) {
  const reader = new FileReader();
  //项目要求是大于1MB的图片进行压缩，可根据项目情况自行判断
  if (file.size > 0.5 * 1024 * 1024) {
    imageConversion.compressAccurately(file.raw, 500).then(res => {
      reader.readAsDataURL(res)
    })
  } else {
    reader.readAsDataURL(file.raw)
  }
  reader.onload = function (e) {
    user.value.imgSrc.push(e.target.result);
  };
}

function handleRemove(file) {
  user.value.imgSrc.splice(user.value.imgSrc.indexOf(file.url), 1);
}

// 获取进入密码
/*
async function get_pass(passtype, pass) {
  await axios.post("/server/get_pass", {passtype: passtype}).then(response => {
    pass.val = response.data[0][1]
  })
}
*/

// 提交方法
async function submit() {
  if (CryptoJS.SHA256(pass.value).toString() === notice_pass.value) {
    user.value.sender = '公告'
    user.value.type = 1
  } else if (user.value.sender === '' || user.value.content === '') {
    alert('昵称或内容为空！')
    return;
  }
  // type判定主页，主页无法随意发消息，主要做展示用
  else if (type_.value === 0) {
    let input = prompt('请输入密码')
    if (CryptoJS.SHA256(input).toString() !== sendpass.value) {
      alert('failed')
      return;
    }
  }
  // 判断ip是否在黑名单
  for (let item of ip_blacklist.value) {
    if (item[0] === user.value.ip) {
      alert('你已被拉黑，请联系管理员')
      return;
    }
  }
  // 数据验证成功，发送消息
  user.value.content = user.value.content.replace("\\n", "\n")
  axios.post("/server/insert_data", user.value).then(response => {
    if (response.data === 'ok') {
      alert('发送成功');
      // 消息内容清空
      user.value.content = ''
      pass.value = ''
      user.value.type = 0
      user.value.imgSrc = []
      upload.value.clearFiles()
      get_message(2)
    } else {
      alert('发送失败')
      get_message(2)
    }
  })
}

function choose_event() {
  if (choose.value) {
    window.removeEventListener('scroll', get_more);
    get_notice()
    return
  }
  window.addEventListener('scroll', get_more);
  get_message(2)
}

// 获取更多
async function get_more() {
  // 获取文档内容的高度
  let documentHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
  // 获取当前视窗的高度
  let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  // 获取滚动条的位置
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  // 判断是否滚动到了页面底部
  if (documentHeight - windowHeight - scrollTop - 1 <= 0) {
    await get_message(1)
    // limit增加
    get_arg.value.get_count += 10
    console.log('滑动到底部')
  }
}


// websocket


// window.addEventListener('scroll', get_data)

// 实现瀑布流
/*const calcRows = () => {
  const masonry = document.querySelector('.wrap')
  const items = masonry.querySelectorAll('.item')
  // 获取当前列数
  const cols = getComputedStyle(masonry).gridTemplateColumns.split(" ").length;
  items.forEach((item, index) => {
    // 给需要上下间隔的元素增加上间隔（每列第一个元素无需上间隔）
    const gapRows = index >= cols ? 8 : 0;
    // 根据元素高度设置元素的需占行数
    const rows = Math.ceil(item.clientHeight / 2) + gapRows;
    item.style.gridRowEnd = `span ${rows}`;
    console.log('ok')
  })
}*/

// window.addEventListener('load', calcRows)
// window.addEventListener('resize', calcRows)
</script>

<template>
  <div id="container">
    <!-- 判断是否为主页 -->
    <div id="home_tip" v-if="type_===0">
      <!--    <h3 style="color:red">该页面为展示页面，请不要随意发送消息</h3>-->
      <router-link to="/class6">你是我的同学吗？聊天记录已迁至class6，点击即跳转</router-link>
      <br/>
      <router-link to="/for_visitors">Hello，这里是外来朋友们讨论的地方（无密码）</router-link>
    </div>
    <!--操作板-->
    <div class="panel">
      <el-form>
        <el-form-item class="input" label="昵称：">
          <el-input v-model="user.sender" id="sender" name="name" placeholder="请输入昵称" type="text"></el-input>
        </el-form-item>
        <el-form-item class="input" label="公告密码：">
          <el-input v-model="pass" id="pass" name="pass" placeholder="发布公告需要密码，其他不需要"
                    type="password"></el-input>
        </el-form-item>
        <el-form-item label="图片：">
          <el-upload
              class="upload-demo"
              ref="upload"
              action="#"
              :auto-upload="false"
              :on-change="handleChange"
              :on-remove="handleRemove"
              :before-upload="uploadContractFun"
              accept="image/*"
              :multiple="true">
            <el-button slot="trigger" type="primary">点击上传图片</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <textarea v-model="user.content" id="content" name="content" placeholder="我也要说说"></textarea>
      <el-button @click="submit">提交</el-button>
      <el-button id="refresh" @click="choose_event">刷新</el-button>
      <el-switch @change="choose_event" v-model="choose" active-text="仅公告" inactive-text="全部消息">
      </el-switch>
    </div>
    <!--  主体-->
    <div id="wrap">
      <!--    消息展示-->
      <div class="item" v-for="(item,index) in messageList" :key="index">
        <span class="sender">{{ item[2] }}:</span>
        <span class="ip">ip: {{ item[7] }}</span>
        <p v-if="item[6]===1" style="color:red" class="content">{{ item[3] }}</p>
        <p v-else class="content">{{ item[3] }}</p>
        <img class="msgImg" v-for="(img,index) in item[4]" :key="index" v-if="item[4][0]!=='null' && item[4][0]!==''"
             :src="'/src/assets/upload/'+img"
             alt="图片"/>
        <div class="otherInfo">
          <span class="small address">地址: {{ item[8] }}</span>
          <span class="small date">{{ item[5] }}</span><br/>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#container {
  /*background: white;
  border-radius: 1em;
  background: rgba(255, 255, 255, 0.5);*/
  //padding: 1em;
}

#wrap {
  width: auto;
  height: auto;
  display: grid;
  grid-template-columns: repeat( auto-fit, minmax(20rem, 1fr) );
  grid-auto-flow: row dense;
}

#home_tip {
  margin: 1rem;
}

.panel {
  width: 80vw;
  margin: 0 auto;
  height: auto;
  /*grid-row: 1 / 3; //grid-column: 1 / 3;*/
}

button {
  margin: 0.5rem;
}

.input {
  width: 98%;
}

textarea {
  margin: 0.5rem;
  padding: 0.7rem;
  width: 95%;
  height: 10rem;
  resize: none;
  display: block;
  border-radius: 0.6rem;
  box-shadow: 0.1rem 0.1rem 0.3rem grey;
}

.item {
  margin: 1rem;
  border-radius: 0.6rem;
  box-shadow: 0.1rem 0.1rem 0.3rem grey;
  position: relative;
}

.msgImg {
  width: 95%;
  height: auto;
  margin: 0.5rem;
}

.item .sender {
  padding: 0.5rem;
  color: grey;
  font-size: 0.8rem;
  position: absolute;
  left: 0;
  top: -0.2rem;
}

.item .ip {
  padding: 0.5rem;
  color: grey;
  font-size: 0.8rem;
  position: absolute;
  right: 0;
  top: -0.2em;
}

.item .content {
  text-align: left;
  margin-left: 1.5rem;
  margin-top: 1.5rem;
  white-space: pre-line;
  overflow: auto;
  padding: 0.1rem;
}

.item .otherInfo {
  margin-top: 2rem;
}

.item .otherInfo .small {
  color: grey;
  font-size: 0.8rem;
}

.item .address {
  position: absolute;
  bottom: 2rem;
  right: 0.5rem;
}

.item .date {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
}
</style>
