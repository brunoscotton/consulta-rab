import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
    proxy: {
      '/api-anac': {
        target:
          'https://sistemas.anac.gov.br',

        changeOrigin: true,

        rewrite: (path) =>
          path.replace(
            /^\/api-anac/,
            ''
          ),
      },
    },
  },
})