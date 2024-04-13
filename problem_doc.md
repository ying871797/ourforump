# 问题文档
* 运行错误：Error: ENOSPC: System limit for number of file watchers reached,
  https://blog.csdn.net/ccgshigao/article/details/109825037
  https://zhuanlan.zhihu.com/p/599156184
* 跨域问题
  https://zhuanlan.zhihu.com/p/663447411#:~:text=%E5%A6%82%E4%BD%95%E5%9C%A8vite%20%E7%94%9F%E4%BA%A7%E7%8E%AF%E5%A2%83%E4%B8%AD%E5%AE%9E%E7%8E%B0%E8%B7%A8%E5%9F%9F%20%E9%9C%80%E8%A6%81%E5%9C%A8vite.config.js%E6%96%87%E4%BB%B6%E4%B8%8B%E9%85%8D%E7%BD%AE%EF%BC%9A%20server%3A%20%7B%20host%3A%20%22127.0.0.1%22%2C%20port%3A,rewrite%3A%20%28path%29%20%3D%3E%20path.replace%28%2F%5E%2Fapi%2F%2C%20%22%22%29%2C%20%7D%2C%20%7D%2C%20%7D%2C
* 点按钮后才加载跨域内容



## 消息刷新问题

```vue
<script setup>
    import {ref} from 'vue'
    // 互动状态
    let status = ref(false)
    
     while (true){
        if (status.value){
            // 执行完之后写status.value = ref(false);
            break;
        }
         sleep(0.002)
         get_data();
    }
    
    function input_(){
       // 是否处于互动状态
    	status.value = ref(true);
    }
    
</script>
```



1. 随着组件互动增多，事件的定义（其中包含对status值的更改）变多