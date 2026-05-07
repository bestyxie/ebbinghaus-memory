import vinext from "vinext";
import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [
    {
      name: 'extension-cors',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/api/extension')) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.setHeader('Access-Control-Max-Age', '86400');
            if (req.method === 'OPTIONS') {
              res.writeHead(204);
              res.end();
              return;
            }
            // Strip Origin header so vinext's dev-mode origin check doesn't block the request
            delete req.headers['origin'];
          }
          next();
        });
      },
    },
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
      'crypto',
    ],
  },

  // 有时候优化依赖也会导致类似问题，可以加上这行以防万一
  optimizeDeps: {
    exclude: ['pg', 'pg-native', '@prisma/client', 'crypto'],
  },
  server: {
    // 允许局域网/外部访问 (相当于命令行的 --host)
    host: true,
    port: 3001,
    //告诉 Vite 信任并放行来自这个域名的请求
    allowedHosts: [
      'host.docker.internal'
    ],
  }
});