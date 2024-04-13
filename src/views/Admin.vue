<script setup>
import {ref} from 'vue'
import axios from "axios";

let messageList = ref([])
let messageShow = ref([])
let ip = ref('')
let activeIndex = ref(-1);

// limit
let get_arg = ref({
  get_count: 10,
  type: 3,
})

start()

async function start() {
  await fetchMessageList()
  document.getElementById('message').addEventListener('scroll', get_more)
}

function addBlackIp() {
  if (ip.value === '') {
    alert('ip不能为空')
    return
  }
  axios.post("/server/add_black_ip", {
    ip: ip.value
  }).then(response => {
    if (response.data === 'ok') {
      alert('添加成功')
      ip.value = ''
    } else {
      alert('添加失败')
    }
  })
}

function handleEdit(index) {
  activeIndex.value = index;
}

async function handleSave(index) {
  await axios.post("/server/update_message", {'data': messageShow.value[index]}).then(response => {
    if (response.data === 'ok') {
      alert('保存成功')
    } else {
      alert('保存失败')
    }
  })
  activeIndex.value = -1;
}

async function handleDelete(index) {
  await axios.post("/server/delete_message", {'data': messageShow.value[index]}).then(response => {
    if (response.data === 'ok') {
      alert('删除成功')
    } else {
      alert('删除失败')
    }
  })
  messageShow.value.splice(index, 1)
  activeIndex.value = -1;
}

async function fetchMessageList() {
  await axios.post("/server/get_message", get_arg.value).then(response => {
    // res.value = ref(response["data"]).value
    // 获取数据并插入res中
    // 图片数据处理，将图片数据分割为数组
    console.log(response.data.length)
    for (let i = 0; i < response.data.length; i++) {
      messageShow.value.push({
        id: response.data[i][0],
        chatroom: response.data[i][1],
        sender: response.data[i][2],
        content: response.data[i][3],
        imgSrc: response.data[i][4],
        datetime: response.data[i][5],
        type: response.data[i][6],
        ip: response.data[i][7],
        address: response.data[i][8],
      })
    }
    messageList.value = messageList.value.concat(ref(response.data).value)
  })
}


async function get_more() {
  const scrollTop = document.getElementById('message').scrollTop;
  const scrollHeight = document.getElementById('message').scrollHeight;
  const clientHeight = document.getElementById('message').clientHeight;
  // 判断是否滚动到了页面底部
  if (scrollTop + clientHeight + 1 >= scrollHeight) {
    get_arg.value.type = 4
    console.log('ok')
    await fetchMessageList()
    // limit增加
    get_arg.value.get_count += 10
  }
}
</script>

<template>
  <h1>管理面板</h1>
  <div id="ip_black">
    <el-form-item label="黑名单ip：">
      <el-input v-model="ip" placeholder="请输入黑名单ip"></el-input>
      <el-button type="primary" @click="addBlackIp">添加</el-button>
    </el-form-item>
  </div>
  <div id="message">
    <el-table border id="msg-table" :data="messageShow">
      <el-table-column prop="id" label="ID">
        <template #default="scope">
          <el-input v-if="activeIndex === scope.$index" v-model="scope.row.id"></el-input>
          <span v-else>{{ scope.row.id }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="chatroom" label="聊天组">
        <template #default="scope">
          <el-input v-if="activeIndex === scope.$index" v-model="scope.row.chatroom"></el-input>
          <span v-else>{{ scope.row.chatroom }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="sender" label="发送者">
        <template #default="scope">
          <el-input v-if="activeIndex === scope.$index" v-model="scope.row.sender"></el-input>
          <span v-else>{{ scope.row.sender }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="内容">
        <template #default="scope">
          <el-input v-if="activeIndex === scope.$index" v-model="scope.row.content"></el-input>
          <span v-else>{{ scope.row.content }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="imgSrc" label="图片路径">
        <template #default="scope">
          <el-input v-if="activeIndex === scope.$index" v-model="scope.row.imgSrc"></el-input>
          <span v-else>{{ scope.row.imgSrc }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="datetime" label="发送时间时间">
        <template #default="scope">
          <el-input v-if="activeIndex === scope.$index" v-model="scope.row.datetime"></el-input>
          <span v-else>{{ scope.row.datetime }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="type" label="类型">
        <template #default="scope">
          <el-input v-if="activeIndex === scope.$index" v-model="scope.row.type"></el-input>
          <span v-else>{{ scope.row.type }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="ip" label="ip">
        <template #default="scope">
          <el-input v-if="activeIndex === scope.$index" v-model="scope.row.ip"></el-input>
          <span v-else>{{ scope.row.ip }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址">
        <template #default="scope">
          <el-input v-if="activeIndex === scope.$index" v-model="scope.row.address"></el-input>
          <span v-else>{{ scope.row.address }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button class="msg-btn" link @click="handleEdit(scope.$index)">编辑</el-button>
          <el-button class="msg-btn" link @click="handleSave(scope.$index)">保存</el-button>
          <el-button class="msg-btn" link @click="handleDelete(scope.$index)">删除</el-button>
        </template>
      </el-table-column>

    </el-table>
  </div>
</template>

<style scoped>
#ip_black {
  margin: auto;
  width: 80vw;
}

button {
  margin: 1rem;
}

.msg-btn {
  color: blue;
}

#message {
  margin-top: 2rem;
  max-height: 30rem;
  overflow-y: auto;
}

#msg-table {
  width: 100%;
  height: 100%;
}
</style>