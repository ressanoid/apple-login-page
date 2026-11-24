import { readFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'

const introPath = fileURLToPath(new URL('./public/intro.html', import.meta.url))

function serveIntro(req: IncomingMessage, res: ServerResponse, next: () => void) {
  if (req.url?.split('?')[0] !== '/') {
    next()
    return
  }

  void readFile(introPath, 'utf8')
    .then((html) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8')
      res.end(html)
    })
    .catch(next)
}

const introPage: Plugin = {
  name: 'intro-page-root',
  configureServer(server) {
    server.middlewares.use(serveIntro)
  },
  configurePreviewServer(server) {
    server.middlewares.use(serveIntro)
  },
}

export default defineConfig({
  plugins: [introPage, react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
