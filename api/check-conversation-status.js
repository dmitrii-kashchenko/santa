export default async function handler(req, res) {
  // Set CORS headers
  // Cannot use '*' with credentials - must use specific origin
  // For localhost/same-origin: derive from request URL if origin header is missing
  let origin = req.headers.origin || process.env.FRONTEND_URL
  
  // If no origin header (same-origin request), try to derive from request
  if (!origin && req.headers.host) {
    const protocol = req.headers['x-forwarded-proto'] || 'http'
    origin = `${protocol}://${req.headers.host}`
  }
  
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin)
    res.setHeader('Access-Control-Allow-Credentials', 'true')
  } else {
    // Last resort: don't set credentials if we can't determine origin
    res.setHeader('Access-Control-Allow-Origin', '*')
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'no-store')

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { conversationId } = req.query

    if (!conversationId) {
      return res.status(400).json({ error: 'conversationId is required' })
    }

    const apiKey = process.env.TAVUS_API_KEY

    if (!apiKey) {
      console.error('[check-conversation-status] Tavus API key not found')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Check conversation status via Tavus API
    const tavusResponse = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      }
    })

    if (!tavusResponse.ok) {
      const errorText = await tavusResponse.text()
      console.error('[check-conversation-status] Tavus API error:', tavusResponse.status, errorText)
      return res.status(tavusResponse.status).json({ 
        error: 'Failed to check conversation status',
        details: errorText
      })
    }

    const conversationData = await tavusResponse.json()
    
    // Check if replica has joined (status might indicate this)
    // Tavus conversations typically have the replica join automatically
    // We'll check the status and assume replica is ready if conversation exists
    const hasReplica = conversationData.status === 'active' || conversationData.status === 'ready' || conversationData.status === 'live'

    console.log('[check-conversation-status] Conversation status:', conversationData.status, 'hasReplica:', hasReplica)
    console.log('[check-conversation-status] Conversation data:', JSON.stringify(conversationData, null, 2))
    console.log('[check-conversation-status] Persona ID in conversation:', conversationData.persona_id)
    console.log('[check-conversation-status] Replica ID in conversation:', conversationData.replica_id)

    return res.status(200).json({
      hasReplica,
      status: conversationData.status,
      conversation_id: conversationData.conversation_id || conversationData.id,
      persona_id: conversationData.persona_id,
      replica_id: conversationData.replica_id
    })
  } catch (error) {
    console.error('[check-conversation-status] Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message
    })
  }
}

