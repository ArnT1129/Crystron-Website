import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["chart.js/auto", "chartjs-plugin-datalabels"],
          maps: ["leaflet"],
          markdown: ["marked"],
        },
      },
    },
  },
});
