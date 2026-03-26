import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import sourceIdentifierPlugin from 'vite-plugin-source-identifier'

const isProd = process.env.BUILD_MODE === 'prod'
export default defineConfig({
  plugins: [
    react(),
    sourceIdentifierPlugin({
      enabled: !isProd,
      attributePrefix: 'data-matrix',
      includeProps: true,
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-recharts': ['recharts'],
          'vendor-geo': ['d3-geo', 'd3-scale', 'd3-interpolate', 'topojson-client'],
          'chunk-map': ['./src/components/WorldMap'],
          'chunk-chart': ['./src/components/PriceChart'],
          'chunk-briefing': ['./src/components/WarBriefingPanel'],
          'chunk-ranking': ['./src/components/RankingPanel', './src/components/RankingSubTabs', './src/components/EnergyMatrixPanel'],
          'chunk-timeline': ['./src/components/WarTimeline'],
        }
      }
    }
  }
})
