import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/index'
import axios from "axios";


// 动态路由实现
let get_routes = []
await axios.get('/server/get_chatroom').then(res => {
    get_routes = res.data
})

const ChatPage = () => import('./views/ChatPage.vue')

for (let item of get_routes) {
    // 判断类型是否为ChatPage
    if (Number(item[3]) !== 3) {
        router.addRoute({
            path: item[0],
            name: item[1],
            meta: {
                title: item[1]
            },
            props: {
                page_name: item[1],
                type_: item[2],
                sendpass: item[3],
                enterpass: item[4],
            },
            component: ChatPage
        })
    }
}


createApp(App).use(ElementPlus).use(router).mount('#app')
