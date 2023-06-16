import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { svgBuilder } from "./src/plugins/svgBuilder";
import path from "path";

function resolve(url: string): string {
  return path.resolve(__dirname, url);
}

export default defineConfig({
  server: {
    host: "0.0.0.0"
  },
  plugins: [vue(), svgBuilder("./src/assets/imgs/")],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      "@": resolve("./src")
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        additionalData: "@import '@/assets/theme.less';"
      }
    }
  }
});
