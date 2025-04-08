import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      //Exclude test files
      external: (id) => /.*\.test.tsx$/.test(id),
    },
  },
  plugins: [
    react(),
    tailwindcss(),

  ],
})
