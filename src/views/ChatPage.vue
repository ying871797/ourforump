<script setup>
import {onMounted, onUnmounted, ref} from 'vue'
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
  type_: Number,
  enterpass: String,
  sendpass: String
})

// submit所用数据
let user = ref({
  msg_id: 1,
  chatroom: props.page_name,
  sender: "",
  content: "",
  imgSrc: [],
  type: 0,
  ip: "",
  address: "",
})

let upload = ref()
// 定义控制弹窗显隐的变量
const dialogVisible = ref(false)
let dialogWidth = ref()

// 定义变量
let messageList = ref([])
let commentList = ref([])
let pass = ref('')
let choose = ref(false)
let isShowPics = ref(false)
// 公告密码
let notice_pass = ref('')
// limit
let get_arg = ref({
  get_count: 10,
  type: 0,
  chatroom: props.page_name,
})
let get_c_arg = ref({
  get_count: 10,
  msg_id: 1,
  type: 0,
  chatroom: props.page_name,
})
let ip_blacklist = ref([])

// 窗口改变大小时改变宽度
window.onresize = () => {
  set_dialog_width()
}

// 进入时执行
onMounted(() => {
  set_dialog_width()
  start_1()
  start()
})

async function start_1() {
  if (props.type_ === 1) {
    // 同步执行
    // 判断之前是否有进入密码的存储
    if (store.get(props.page_name).value !== 'ok') {
      let input = prompt("请输入进入密码：")
      if (CryptoJS.SHA256(input).toString() === props.enterpass) {
        // 设置进入密码localStorage，三天失效
        store.set(props.page_name, 'ok', Date.now() + 1000 * 60 * 60 * 24 * 3)
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

// 弹窗自适应宽度
function set_dialog_width() {
  let val = document.body.clientWidth
  const def = 800 // 默认宽度
  if (val < def) {
    dialogWidth.value = '80%'
  } else {
    dialogWidth.value = def + 'px'
  }
}

// 获取ip地址
async function get_ip_address() {
  await fetch('http://ip-api.com/json')
      .then(res => res.json())
      .then(data => {
        user.value.ip = ref(data.query).value
      })
  fetch('https://www.fkcoder.com/ip?ip=' + user.value.ip)
      .then(res => res.json())
      .then(data => {
        user.value.address = ref(data['country'] + ' ' + data['province'] + ' ' + data['city']).value
      })

  // 访问记录插入
  await axios.post("/server/record_aqr", {'ip': user.value.ip, 'page_name': props.page_name})
}

// 获取黑名单
function get_ip_blacklist() {
  axios.post("/server/get_all", {'table': 'ipblacklist'}).then(response => {
    ip_blacklist.value = ref(response.data).value
  })
}

// 获取消息
function get_message(type) {
  get_arg.value.type = type
  // type为2时，获取最新消息
  if (type === 2) get_arg.value.get_count = 10
  axios.post("/server/get_message", get_arg.value).then(response => {
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

function get_comments(type) {
  get_c_arg.value.type = type
  // type为2时，获取最新消息
  if (type === 2) get_c_arg.value.get_count = 10
  axios.post("/server/get_comments", get_c_arg.value).then(response => {
    // 获取数据并插入res中
    // 图片数据处理，将图片数据分割为数组
    for (let i = 0; i < response.data.length; i++) {
      response.data[i][4] = String(response.data[i][4]).split(',');
    }
    if (type === 2) {
      commentList.value = ref(response.data).value
      return
    }
    commentList.value = commentList.value.concat(ref(response.data).value)
  })
}

// 提交评论方法
async function submit_c() {
  if (user.value.sender === '' || user.value.content === '') {
    alert('昵称或内容为空！')
    if (user.value.content === '') return;
    user.value.sender = prompt('请输入昵称')
  }
  // type判定主页，主页无法随意发消息，主要做展示用
  else if (props.type_ === 0) {
    alert('主页无法随意发消息！')
    return;
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
  axios.post("/server/insert_comment", user.value).then(response => {
    if (response.data === 'ok') {
      alert('发送成功');
      // 消息内容清空
      user.value.content = ''
      user.value.type = 0
      user.value.imgSrc = []
      upload.value.clearFiles()
      get_comments(2)
      get_message(2)
    } else {
      alert('发送失败')
      get_comments(2)
      get_message(2)
    }
  })
}

// 提交消息方法
async function submit() {
  if (CryptoJS.SHA256(pass.value).toString() === notice_pass.value) {
    user.value.sender = '公告'
    user.value.type = 1
  } else if (user.value.sender === '' || user.value.content === '') {
    alert('昵称或内容为空！')
    return;
  }
  // type判定主页，主页无法随意发消息，主要做展示用
  else if (props.type_ === 0) {
    let input = prompt('请输入密码')
    if (CryptoJS.SHA256(input).toString() !== props.sendpass) {
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

// 选择按钮事件
function choose_event() {
  if (choose.value) {
    window.removeEventListener('scroll', get_more);
    get_notice()
    return
  }
  window.addEventListener('scroll', get_more);
  get_message(2)
}

// 获取更多消息
function get_more() {
  // 获取文档内容的高度
  let documentHeight = document.body.scrollHeight || document.documentElement.scrollHeight;
  // 获取当前视窗的高度
  let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  // 获取滚动条的位置
  let scrollTop = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
  // 判断是否滚动到了页面底部
  if (documentHeight - windowHeight - scrollTop - 1 <= 0) {
    get_message(1)
    // limit增加
    get_arg.value.get_count += 10
  }
}

// 获取更多评论
async function get_more_c() {
  const scrollTop = document.getElementById('comment-show').scrollTop;
  const scrollHeight = document.getElementById('comment-show').scrollHeight;
  const clientHeight = document.getElementById('comment-show').clientHeight;
  // 判断是否滚动到了页面底部
  if (scrollTop + clientHeight + 1 >= scrollHeight) {
    get_c_arg.value.type = 4
    get_comments(1)
    // limit增加
    get_c_arg.value.get_count += 10
  }
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
  <!--  评论展示弹窗-->
  <!--  弹窗关闭时重置get_c_arg.get_count-->
  <el-dialog class="dialog" destroy-on-close @close="get_c_arg.get_count=10" v-model="dialogVisible"
             :width="dialogWidth">
    <nav id="nav">
      <h3>{{ commentList.length }}条评论</h3>
    </nav>
    <div id="comment-show" @scroll="get_more_c">
      <div class="comment-item" v-for="(item,index) in commentList" :key="index">
        <hr/>
        <span class="sender">{{ item[2] }}:</span>
        <span class="ip">ip: {{ item[7] }}</span>
        <p v-if="item[6]===1" style="color:red" class="content">{{ item[3] }}</p>
        <p v-else class="content">{{ item[3] }}</p>
        <el-image @click="isShowPics=true" class="msgImg" v-for="(img,index) in item[4]" :key="index"
                  v-if="item[4][0]!=='null' && item[4][0]!==''"
                  :src="'/src/assets/upload/'+img"
                  alt="图片"></el-image>
        <!--        <el-image-viewer :src-list="item[4]" :z-index="1000"></el-image-viewer>-->
        <div class="otherInfo">
          <span class="small address">地址: {{ item[8] }}</span>
          <span class="small date">{{ item[5] }}</span><br/>
        </div>
      </div>
    </div>
    <hr/>
    <!--操作板-->
    <div class="panel">
      <el-form>
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
            <el-button slot="trigger" type="primary">上传</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <div id="btn_c">
        <el-button class="btn_c" @click="submit_c">提交</el-button>
      </div>
      <textarea v-model="user.content" id="content_c" name="content" placeholder="我也要说说"></textarea>
    </div>
  </el-dialog>
  <!--  内容展示主体-->
  <div id="container">
    <!-- 判断是否为主页 -->
    <div id="home_tip" v-if="props.type_===0">
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
        <el-image @click="isShowPics=true" class="msgImg" v-for="(img,index) in item[4]" :key="index"
                  v-if="item[4][0]!=='null' && item[4][0]!==''"
                  :src="'/src/assets/upload/'+img"
                  alt="图片"></el-image>
        <!--        <el-image-viewer :src-list="item[4]" :z-index="1000"></el-image-viewer>-->
        <div class="otherInfo">
          <span class="small address">地址: {{ item[8] }}</span>
          <span class="small date">{{ item[5] }}</span><br/>
        </div>
        <!--        msg_id均设置为item[0]，方便评论弹窗获取评论数据-->
        <el-button v-if="props.type_!==0" class="comment" link
                   @click="user.msg_id=item[0];get_c_arg.msg_id=item[0];dialogVisible=true;get_comments(2);">
          评论↓{{ item[9] }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
  position: relative;
  /*grid-row: 1 / 3; //grid-column: 1 / 3;*/
}

button {
  margin: 0.5rem;
}

#btn_c {
  position: absolute;
  top: 0;
  left: 10rem;
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

.panel #content_c {
  margin: 0.5rem;
  padding: 0.7rem;
  width: 65%;
  height: 3rem;
  resize: none;
  display: block;
  border-radius: 0.6rem;
  box-shadow: 0.1rem 0.1rem 0.3rem grey;
}

#comment-show {
  height: 20rem;
  overflow-y: auto;
  margin-top: 1rem;
}

.item {
  margin: 1rem;
  border-radius: 0.6rem;
  box-shadow: 0.1rem 0.1rem 0.3rem grey;
  position: relative;
}

.comment-item {
  position: relative;
}

.msgImg {
  width: 95%;
  height: auto;
  margin: 0.5rem;
}

.sender {
  padding: 0.5rem;
  color: grey;
  font-size: 0.8rem;
  position: absolute;
  left: 0;
  top: -0.2rem;
}

.ip {
  padding: 0.5rem;
  color: grey;
  font-size: 0.8rem;
  position: absolute;
  right: 0;
  top: -0.2em;
}

.content {
  text-align: left;
  margin-left: 1.5rem;
  margin-top: 1.5rem;
  white-space: pre-line;
  overflow: auto;
  padding: 0.1rem;
}

.otherInfo {
  margin-top: 2rem;
}

.otherInfo .small {
  color: grey;
  font-size: 0.8rem;
}

.address {
  position: absolute;
  bottom: 2rem;
  right: 0.5rem;
}

.date {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
}

.comment {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
}
</style>
