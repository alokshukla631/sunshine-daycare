import express from 'express'
import { createServer as createViteServer } from 'vite'
import chatHandler from './api/chat.js'

const app = express()
app.use(express.json())

app.post('/api/chat', (req, res) => chatHandler(req, res))

const vite = await createViteServer({ server: { middlewareMode: true } })
app.use(vite.middlewares)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`)
})
