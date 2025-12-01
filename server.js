import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())

// Import and convert the API handlers
import createConversationHandler from './api/create-conversation.js'
import checkConversationStatusHandler from './api/check-conversation-status.js'

// Helper function to convert Express req/res to Vercel handler format
const createVercelReq = (req) => ({
  method: req.method,
  headers: req.headers,
  body: req.body,
  query: req.query,
  url: req.url
})

const createVercelRes = (res) => {
  let statusCode = 200
  const vercelRes = {
    status: (code) => {
      statusCode = code
      return vercelRes
    },
    json: (data) => {
      res.status(statusCode).json(data)
    },
    end: () => {
      res.status(statusCode).end()
    },
    setHeader: (name, value) => {
      res.setHeader(name, value)
    },
    getHeader: (name) => {
      return res.getHeader(name)
    }
  }
  return vercelRes
}

// API Routes - Handle OPTIONS for CORS preflight
app.options('/api/create-conversation', (req, res) => {
  res.status(200).end()
})

app.options('/api/check-conversation-status', (req, res) => {
  res.status(200).end()
})

app.post('/api/create-conversation', async (req, res) => {
  const vercelReq = createVercelReq(req)
  const vercelRes = createVercelRes(res)
  
  try {
    await createConversationHandler(vercelReq, vercelRes)
  } catch (error) {
    console.error('[server] Error in create-conversation handler:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  }
})

app.get('/api/check-conversation-status', async (req, res) => {
  const vercelReq = createVercelReq(req)
  const vercelRes = createVercelRes(res)
  
  try {
    await checkConversationStatusHandler(vercelReq, vercelRes)
  } catch (error) {
    console.error('[server] Error in check-conversation-status handler:', error)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error', message: error.message })
    }
  }
})

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`)
  console.log(`API endpoint: http://localhost:${PORT}/api/create-conversation`)
})
