import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => {
  const nodeEnv = mode === "production" ? "production" : "development";

  return {
    plugins: [react()],
    define: {
      "process.env.IS_PREACT": JSON.stringify("false"),
      "process.env.NODE_ENV": JSON.stringify(nodeEnv)
    },
    optimizeDeps: {
      rolldownOptions: {
        transform: {
          define: {
            "process.env.IS_PREACT": JSON.stringify("false"),
            "process.env.NODE_ENV": JSON.stringify("development")
          }
        }
      }
    },
    server: {
      port: 5173,
      proxy: {
        "/api": {
          target: "http://192.168.29.221:8080",
          changeOrigin: true
        },
        "/oauth2": {
          target: "http://192.168.29.221:8080",
          changeOrigin: false
        },
        "/logout": {
          target: "http://192.168.29.221:8080",
          changeOrigin: true
        }
      }
    }
  };
});
