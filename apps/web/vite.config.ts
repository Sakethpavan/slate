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
          target: "http://localhost:8080",
          changeOrigin: true
        },
        "/oauth2": {
          target: "http://localhost:8080",
          changeOrigin: true
        },
        "/logout": {
          target: "http://localhost:8080",
          changeOrigin: true
        }
      }
    }
  };
});
