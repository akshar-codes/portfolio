import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react-vendor";
          if (/node_modules\/@mui\//.test(id)) return "mui-vendor";
          if (/node_modules\/@emotion\//.test(id)) return "emotion-vendor";
          if (/node_modules\/@tiptap\//.test(id)) return "editor-vendor";
          if (/node_modules\/(react-icons|@fortawesome)\//.test(id)) return "icon-vendor";
        },
      },
    },
  },
});
