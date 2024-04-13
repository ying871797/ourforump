import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        host: "localhost", // 开发服务器的地址
        port: 8888,        // 开发服务器的端口号
        proxy: {
            "/server": {
                target: "http://127.0.0.1:5000", // 目标地址
                changeOrigin: true,            // 是否换源
                rewrite: (path) => path.replace(/^\/server/, ""),
            },
            "/api": {
                target: "https://www.ip.cn/api/index?ip&type=0", // 目标地址
                changeOrigin: true,            // 是否换源
                rewrite: (path) => path.replace(/^\/api/, ""),
            },
        },
    },
})
