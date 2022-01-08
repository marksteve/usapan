import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: process.env.EXAMPLE
    ? {
        outDir: './example',
      }
    : {
        lib: {
          entry: path.resolve(__dirname, 'src/main.tsx'),
          name: 'usapan',
          fileName: (format) => `usapan.${format}.js`,
        },
      },
})
