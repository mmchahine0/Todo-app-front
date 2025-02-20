import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";
import { htmlPlugin } from "./vite-html-plugin";

export default defineConfig({
  plugins: [
    react(),
    htmlPlugin(),
    // Gzip compression
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024, // Compress files larger than 1kb
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html)$/i,
      verbose: true,
      compressionOptions: {
        level: 9, // Maximum compression level
      },
    }),
    // Additional Brotli compression
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html)$/i,
      compressionOptions: {
        level: 11,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-components": [
            "@radix-ui/react-alert-dialog",
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label",
            "@radix-ui/react-select",
            "@radix-ui/react-separator",
            "@radix-ui/react-slot",
            "@radix-ui/react-switch",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
          "state-management": [
            "@reduxjs/toolkit",
            "react-redux",
            "redux",
            "redux-persist",
          ],
          query: ["@tanstack/react-query"],
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },

    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ["console.log"],
      },
      format: {
        comments: false,
      },
    },

    chunkSizeWarningLimit: 1000,
    assetsInlineLimit: 4096,
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },

  server: {
    port: 3000,
    open: true,
    cors: true,
    host: true,
    hmr: {
      overlay: true,
    },
  },

  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@reduxjs/toolkit",
      "react-redux",
      "redux-persist",
    ],
  },

  experimental: {
    hmrPartialAccept: true,
  },
});
