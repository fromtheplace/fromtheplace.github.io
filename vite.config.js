import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // fromtheplace.github.io/scroll/ is a sub-path, not the domain root,
  // so Vite needs to know that to emit correct asset URLs on build.
  base: '/',
})
