import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 10240, // Only compress files larger than 10kb
      deleteOriginFile: false,
      filter: /\.(js|mjs|json|css|html)$/i,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable source maps for debugging
    sourcemap: true,

    // Optimize chunk size
    rollupOptions: {
      output: {
        manualChunks: {
          // Group major dependencies
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
        // Customize chunk filenames
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
    },

    // Optimize build
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
      },
    },

    // Configure chunk size warnings
    chunkSizeWarningLimit: 1000,

    // Asset optimization
    assetsInlineLimit: 4096, // 4kb - files smaller than this will be inlined

    // Output directory configuration
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
  },

  // Development server configuration
  server: {
    port: 3000,
    open: true,
    cors: true,
    host: true,
    hmr: {
      overlay: true,
    },
  },

  // Optimize dependencies pre-bundling
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

  // Enable fast refresh
  experimental: {
    hmrPartialAccept: true,
  },
});
