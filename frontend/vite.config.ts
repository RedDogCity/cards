import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
<<<<<<< HEAD
react(),tailwindcss(),],
=======
    react(),
    tailwindcss(),

  ],
>>>>>>> 27cb8c826ea3970242a5167c48405e04ffb3cb7f
})
