import vinext from "vinext";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    vinext(),
    ...(process.env.NODE_ENV === 'production'
      ? [
        cloudflare({
          viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        }),
      ]
      : []),
  ],
  ssr: {
    // 强制 Vite 在服务端渲染时跳过这些 Node.js 原生包
    external: [
      'pg',
      'pg-native',
      '@prisma/client',
      'prisma',
    ],
  },

  // 有时候优化依赖也会导致类似问题，可以加上这行以防万一
  optimizeDeps: {
    exclude: ['pg', 'pg-native', '@prisma/client'],
  },
  server: {
    // 允许局域网/外部访问 (相当于命令行的 --host)
    host: true,
    port: 3001,
    //告诉 Vite 信任并放行来自这个域名的请求
    allowedHosts: [
      'host.docker.internal'
    ]
  }
});