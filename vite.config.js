import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: ["edge90", "chrome90", "firefox90", "safari15"],
  },
  server: {
    host: "0.0.0.0", // 开发服务器的地址
    port: 80, // 开发服务器的端口号
    proxy: {
      "/server": {
        target: "http://0.0.0.0:5000", // 目标地址
        changeOrigin: true, // 是否换源
        rewrite: (path) => path.replace(/^\/server/, ""),
        // 关键点：配置代理请求头
        configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
                // req.socket.remoteAddress 是浏览器连接 Vite 的 IP
                // 将其塞入 X-Real-IP 这个自定义头中
                const ip = req.socket.remoteAddress;
                proxyReq.setHeader('X-Real-IP', ip);
                proxyReq.setHeader('X-Forwarded-For', ip);
            });
        }
      },
    },
  },
});
