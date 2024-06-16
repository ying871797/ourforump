<script setup>
import {ref} from 'vue'

let user = ref({
  chatroom: 'test',
  sender: "",
  content: "",
  imgSrc: {src: []},
  type: 0,
  ip: "",
  address: "",
})

function uploadImage(file) {
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = function (e) {
    user.value.imgSrc.src.push(e.target.result);
  };
}

function submitForm() {
  console.log(user.value.imgSrc.src);
}
</script>

<template>
  <el-form enctype="multipart/form-data">
    <el-form-item class="input" label="昵称：">
      <el-input v-model="user.sender" id="sender" name="name" placeholder="请输入昵称" type="text"></el-input>
    </el-form-item>
    <el-form-item class="input" label="公告密码：">
      <el-input v-model="user.content" id="pass" name="pass" placeholder="发布公告需要密码，其他不需要"
                type="password"></el-input>
    </el-form-item>
    <el-form-item label="Image">
      <el-upload
          class="upload-demo"
          action=""
          :auto-upload="false"
          :on-change="uploadImage">
        <el-button slot="trigger" type="primary">Upload</el-button>
      </el-upload>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm">Submit</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped>

</style>