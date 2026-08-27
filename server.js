// Minimal static server for the GNSW members portal.
// - Serves the Vite `dist/` build.
// - SPA fallback: unknown routes -> index.html (so deep links reload correctly).
// - Caching: hashed /assets/* are cached long-term (immutable);
//   everything else (index.html, favicon) is served with no-cache so new
//   deployments are picked up on the next page load.
// NOTE: package.json has "type": "module", so this file must use ESM imports.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// __dirname replacement for ESM modules.
const __filename = fileURLToPath(import.meta.url)
const __dirname_ = path.dirname(__filename)

const DIST = path.resolve(__dirname_, 'dist')
const PORT = process.env.PORT || 3000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain',
}

const server = http.createServer((req, res) => {
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    const relative = urlPath === '/' ? '/index.html' : urlPath
    const normalized = path.posix.normalize(relative).replace(/^[/.]+/, '')
    const filePath = path.resolve(DIST, normalized)

    // Path traversal guard
    if (!filePath.startsWith(DIST + path.sep) && filePath !== DIST) {
      res.writeHead(403)
      res.end('Forbidden')
      return
    }

    let target = filePath
    if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) {
      target = path.join(DIST, 'index.html') // SPA fallback
    }

    const ext = path.extname(target).toLowerCase()
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' }

    if (/^\/assets\//.test(relative)) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable'
    } else {
      headers['Cache-Control'] = 'no-cache'
    }

    fs.readFile(target, (err, data) => {
      if (err) {
        res.writeHead(404)
        res.end('Not Found')
        return
      }
      res.writeHead(200, headers)
      res.end(data)
    })
  } catch (e) {
    res.writeHead(500)
    res.end('Server error')
  }
})

server.listen(PORT, () => {
  console.log(`Serving ${DIST} on port ${PORT}`)
})
