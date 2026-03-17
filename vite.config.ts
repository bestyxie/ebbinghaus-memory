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
      'bcrypt'
    ],
  },

  // 有时候优化依赖也会导致类似问题，可以加上这行以防万一
  optimizeDeps: {
    exclude: ['pg', 'pg-native', '@prisma/client', 'bcrypt'],
  }
});