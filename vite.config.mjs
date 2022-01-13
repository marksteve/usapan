import preact from '@preact/preset-vite'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import remarkParse from 'remark-parse'
import { readSync } from 'to-vfile'
import { unified } from 'unified'
import { defineConfig } from 'vite'
import { injectHtml } from 'vite-plugin-html'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    preact(),
    injectHtml({
      data: { readme: parseReadme() },
    }),
  ],
  build: process.env.EXAMPLE
    ? {
        outDir: './example',
      }
    : {
        lib: {
          entry: './src/main.tsx',
          name: 'usapan',
          fileName: (format) => `usapan.${format}.js`,
        },
      },
})

function parseReadme() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
    .processSync(readSync('README.md'))
}
