import process from "node:process";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxyTarget = env.VITE_DEV_API_PROXY_TARGET?.trim();

  return {
    plugins: [react()],
    ...(proxyTarget && {
      server: {
        proxy: {
          "/api": {
            target: proxyTarget,
            changeOrigin: true,
            configure(proxy) {
              // Requests reach the API through this same-origin dev server,
              // so don't forward the browser's localhost Origin to production CORS.
              proxy.on("proxyReq", (proxyRequest) => {
                proxyRequest.removeHeader("origin");
              });
            },
          },
        },
      },
    }),
    build: {
      chunkSizeWarningLimit: 900,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (/node_modules\/(react|react-dom|scheduler)\//.test(id))
              return "react-vendor";
            if (/node_modules\/@mui\//.test(id)) return "mui-vendor";
            if (/node_modules\/@emotion\//.test(id)) return "emotion-vendor";
            if (/node_modules\/@tiptap\//.test(id)) return "editor-vendor";
            if (/node_modules\/(react-icons|@fortawesome)\//.test(id))
              return "icon-vendor";
          },
        },
      },
    },
  };
});
