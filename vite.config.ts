import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [vinext()],
  ssr: {
    // 强制 Vite 在服务端渲染时跳过这些 Node.js 原生包
    external: [
      'pg',
      'pg-native',
      '@prisma/client',
      'prisma',
      'bcrypt'
    ],
  },

  // 有时候优化依赖也会导致类似问题，可以加上这行以防万一
  optimizeDeps: {
    exclude: ['pg', 'pg-native', '@prisma/client', 'bcrypt'],
  }
});