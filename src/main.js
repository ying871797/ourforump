import {createApp} from 'vue'
import './style.css'
import App from './App.vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from './router/index'
import axios from "axios";


const app = createApp(App)
app.use(router)
app.use(ElementPlus)

// 先挂载基础应用
app.mount('#app')

// 动态路由实现
let get_routes = []
await axios.get('/server/get_chatroom').then(res => {
    get_routes = res.data
})


// deepseek实现
// 动态路由加载函数（独立出来以便复用）
const loadDynamicRoutes = async () => {
    // 尝试从本地缓存获取
    const CACHE_KEY = 'dynamic_routes_v1'
    const cachedRoutes = localStorage.getItem(CACHE_KEY)

    let routesData = []

    try {
        if (cachedRoutes) {
            routesData = JSON.parse(cachedRoutes)
        } else {
            const response = await axios.get('/server/get_chatroom')
            routesData = response.data

            // 缓存数据（设置1小时有效期）
            localStorage.setItem(CACHE_KEY, JSON.stringify(routesData))
            localStorage.setItem(`${CACHE_KEY}_timestamp`, Date.now())
        }

        // 添加动态路由
        routesData.forEach(item => {
            // 解构数据项，添加注释说明每个字段
            const [
                path,       // 路由路径 (item[0])
                name,       // 路由名称 (item[1])
                type,       // 页面类型 (item[2])
                sendpass,   // 发送密码 (item[3])
                enterpass   // 进入密码 (item[4])
            ] = item

            if (Number(type) !== 3) {
                router.addRoute({
                    path,
                    name,
                    meta: {title: name},
                    props: {
                        page_name: name,
                        type_: type,
                        sendpass,
                        enterpass
                    },
                    // 使用动态导入确保代码分割
                    component: () => import('./views/ChatPage.vue')
                })
            }
        })

        // 重定向到当前路由以确保新路由生效
        const currentPath = router.currentRoute.value.fullPath
        router.replace(currentPath).catch(() => {
        })

    } catch (error) {
        console.error('动态路由加载失败:', error)
        // 错误处理：重定向到错误页面或显示提示
        router.replace('/error?code=route_load_failed')
    }
}

// 添加路由加载状态管理
router.beforeEach(async (to, from, next) => {
    // 检查是否需要动态路由
    if (to.meta.requiresDynamicRoutes && !window.dynamicRoutesLoaded) {
        try {
            await loadDynamicRoutes()
            window.dynamicRoutesLoaded = true
            next(to.fullPath) // 重新导航到目标页面
        } catch (error) {
            next('/error')
        }
    } else {
        next()
    }
})

// 启动路由加载（可根据需要调整时机）
loadDynamicRoutes()

// 添加缓存清理逻辑（1小时后失效）
setInterval(() => {
    const CACHE_KEY = 'dynamic_routes_v1'
    const timestamp = localStorage.getItem(`${CACHE_KEY}_timestamp`)

    if (timestamp && Date.now() - timestamp > 3600000) {
        localStorage.removeItem(CACHE_KEY)
        localStorage.removeItem(`${CACHE_KEY}_timestamp`)
        window.dynamicRoutesLoaded = false // 重置加载状态
    }
}, 60000) // 每分钟检查一次

/*const ChatPage = () => import('./views/ChatPage.vue')

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
}*/
