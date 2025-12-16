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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'no-store')

  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // BotID verification
  // Error handling ensures API continues to work even if BotID isn't configured
  // In development, checkBotId() always returns { isBot: false } by default
  // Use developmentOptions.bypass: 'BAD-BOT' to test bot detection locally
  // Only enforce BotID if BOTID_SECRET is explicitly configured
  if (process.env.BOTID_SECRET) {
    try {
      const { checkBotId } = await import('botid/server')
      const verification = await checkBotId({
        // Uncomment the line below to test bot detection in development:
        // developmentOptions: { bypass: 'BAD-BOT' }, // Options: 'HUMAN' (default) or 'BAD-BOT'
      })
      if (verification.isBot) {
        console.warn('[create-conversation] BotID detected bot, blocking request')
        return res.status(403).json({ error: 'Access denied' })
      }
    } catch (error) {
      // BotID check failed - log warning but continue processing
      // This is expected if BotID isn't properly configured
      console.warn('[create-conversation] BotID check failed, continuing without bot protection:', error.message)
      // Continue without BotID protection if it's not properly configured
    }
  } else {
    // BotID not configured - skip check
    console.log('[create-conversation] BotID not configured (BOTID_SECRET missing), skipping bot check')
  }

  try {
    // ==========================================
    // COMPREHENSIVE LOGGING - Log ALL incoming data
    // ==========================================
    console.log('[create-conversation] ==========================================')
    console.log('[create-conversation] INCOMING REQUEST DATA:')
    console.log('[create-conversation] Query params:', JSON.stringify(req.query, null, 2))
    console.log('[create-conversation] Body keys:', Object.keys(req.body || {}))
    console.log('[create-conversation] Full body:', JSON.stringify(req.body, null, 2))
    
    // Check for persona/replica in query params
    if (req.query?.persona_id) {
      console.warn('[create-conversation] ⚠️ WARNING: persona_id found in req.query:', req.query.persona_id)
    }
    if (req.query?.replica_id) {
      console.warn('[create-conversation] ⚠️ WARNING: replica_id found in req.query:', req.query.replica_id)
    }
    
    // Check for persona/replica in body
    if (req.body?.persona_id) {
      console.warn('[create-conversation] ⚠️ WARNING: persona_id found in req.body:', req.body.persona_id)
    }
    if (req.body?.replica_id) {
      console.warn('[create-conversation] ⚠️ WARNING: replica_id found in req.body:', req.body.replica_id)
    }
    
    // Check for persona/replica in body.properties
    if (req.body?.properties?.persona_id) {
      console.warn('[create-conversation] ⚠️ WARNING: persona_id found in req.body.properties:', req.body.properties.persona_id)
    }
    if (req.body?.properties?.replica_id) {
      console.warn('[create-conversation] ⚠️ WARNING: replica_id found in req.body.properties:', req.body.properties.replica_id)
    }
    console.log('[create-conversation] ==========================================')
    
    // ==========================================
    // REMOVE persona_id and replica_id from ALL possible sources
    // ==========================================
    
    // 1. Remove from req.query
    if (req.query?.persona_id) {
      console.warn('[create-conversation] Removing persona_id from req.query:', req.query.persona_id)
      delete req.query.persona_id
    }
    if (req.query?.replica_id) {
      console.warn('[create-conversation] Removing replica_id from req.query:', req.query.replica_id)
      delete req.query.replica_id
    }
    
    // 2. Remove from req.body
    if (req.body?.persona_id) {
      console.warn('[create-conversation] Removing persona_id from req.body:', req.body.persona_id)
      delete req.body.persona_id
    }
    if (req.body?.replica_id) {
      console.warn('[create-conversation] Removing replica_id from req.body:', req.body.replica_id)
      delete req.body.replica_id
    }
    
    // 3. Remove from req.body.properties if it exists
    if (req.body?.properties) {
      if (req.body.properties.persona_id) {
        console.warn('[create-conversation] Removing persona_id from req.body.properties:', req.body.properties.persona_id)
        delete req.body.properties.persona_id
      }
      if (req.body.properties.replica_id) {
        console.warn('[create-conversation] Removing replica_id from req.body.properties:', req.body.properties.replica_id)
        delete req.body.properties.replica_id
      }
    }
    
    // 4. Extract and clean custom_greeting and language
    let custom_greeting = req.body?.custom_greeting
    let language = req.body?.language
    
    // If custom_greeting is an object, check for persona_id/replica_id and extract string value
    if (custom_greeting && typeof custom_greeting === 'object') {
      console.warn('[create-conversation] custom_greeting is an object, checking for persona/replica fields')
      if (custom_greeting.persona_id) {
        console.warn('[create-conversation] Removing persona_id from custom_greeting object:', custom_greeting.persona_id)
        delete custom_greeting.persona_id
      }
      if (custom_greeting.replica_id) {
        console.warn('[create-conversation] Removing replica_id from custom_greeting object:', custom_greeting.replica_id)
        delete custom_greeting.replica_id
      }
      // If it's an object, try to extract a text property or convert to string
      custom_greeting = custom_greeting.text || custom_greeting.message || JSON.stringify(custom_greeting)
    }
    
    // If language is an object, check for persona_id/replica_id
    if (language && typeof language === 'object') {
      console.warn('[create-conversation] language is an object, checking for persona/replica fields')
      if (language.persona_id) {
        console.warn('[create-conversation] Removing persona_id from language object:', language.persona_id)
        delete language.persona_id
      }
      if (language.replica_id) {
        console.warn('[create-conversation] Removing replica_id from language object:', language.replica_id)
        delete language.replica_id
      }
      // Extract language code if it's an object
      language = language.code || language.lang || language.language
    }
    
    // Ensure custom_greeting is a string or null
    if (custom_greeting && typeof custom_greeting !== 'string') {
      custom_greeting = String(custom_greeting)
    }
    
    // Ensure language is a string or null
    if (language && typeof language !== 'string') {
      language = String(language)
    }

    // Log the cleaned values
    console.log('[create-conversation] Cleaned custom_greeting:', custom_greeting ? `${custom_greeting.substring(0, 100)}... (length: ${custom_greeting.length})` : 'none')
    console.log('[create-conversation] Cleaned language:', language || 'not provided')

    // Get API key from server-side environment variable (not exposed to client)
    const apiKey = process.env.TAVUS_API_KEY

    if (!apiKey) {
      console.error('[create-conversation] Tavus API key not found')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    // Map language codes to Tavus API language format
    // Only includes languages supported by Tavus API
    const languageMap = {
      'ru': 'russian',
      'en': 'english',
      'fr': 'french',
      'de': 'german',
      'es': 'spanish',
      'pt': 'portuguese',
      'zh': 'chinese',
      'ja': 'japanese',
      'hi': 'hindi',
      'it': 'italian',
      'ko': 'korean',
      'nl': 'dutch',
      'pl': 'polish',
      'sv': 'swedish',
      'tr': 'turkish',
      'id': 'indonesian',
      'fil': 'filipino',
      'bg': 'bulgarian',
      'ro': 'romanian',
      'ar': 'arabic',
      'cs': 'czech',
      'el': 'greek',
      'fi': 'finnish',
      'hr': 'croatian',
      'ms': 'malay',
      'sk': 'slovak',
      'da': 'danish',
      'ta': 'tamil',
      'uk': 'ukrainian',
      'hu': 'hungarian',
      'no': 'norwegian',
      'vi': 'vietnamese'
    }

    // HARDCODED VALUES - NEVER CHANGE THESE
    const HARDCODED_PERSONA_ID = 'pc3f72e3cf67'
    const HARDCODED_REPLICA_ID = 'raa1d440ec4a'
    
    // ==========================================
    // BUILD FINAL REQUEST BODY - NO SPREAD OPERATORS
    // Build property by property to avoid any merging
    // ==========================================
    const finalRequestBody = {}
    
    // Set required fields explicitly
    finalRequestBody.enable_dynamic_greeting = false
    finalRequestBody.persona_id = HARDCODED_PERSONA_ID
    finalRequestBody.replica_id = HARDCODED_REPLICA_ID
    finalRequestBody.conversation_name = 'Santa Call'
    
    // Add custom_greeting only if it's a valid string
    if (custom_greeting && typeof custom_greeting === 'string' && custom_greeting.trim().length > 0) {
      finalRequestBody.custom_greeting = custom_greeting.trim()
    }
    
    // Add language properties only if language is provided
    if (language && typeof language === 'string') {
      const tavusLanguage = languageMap[language.toLowerCase()] || languageMap['ru']
      finalRequestBody.properties = {
        language: tavusLanguage
      }
      // Ensure properties doesn't contain persona_id or replica_id
      if (finalRequestBody.properties.persona_id) {
        delete finalRequestBody.properties.persona_id
      }
      if (finalRequestBody.properties.replica_id) {
        delete finalRequestBody.properties.replica_id
      }
    }
    
    // ==========================================
    // FINAL VALIDATION - Verify persona_id and replica_id
    // ==========================================
    if (finalRequestBody.persona_id !== HARDCODED_PERSONA_ID) {
      console.error('[create-conversation] ❌ CRITICAL ERROR: persona_id mismatch!')
      console.error('[create-conversation] Expected:', HARDCODED_PERSONA_ID)
      console.error('[create-conversation] Got:', finalRequestBody.persona_id)
      // Force correct value
      finalRequestBody.persona_id = HARDCODED_PERSONA_ID
    }
    
    if (finalRequestBody.replica_id !== HARDCODED_REPLICA_ID) {
      console.error('[create-conversation] ❌ CRITICAL ERROR: replica_id mismatch!')
      console.error('[create-conversation] Expected:', HARDCODED_REPLICA_ID)
      console.error('[create-conversation] Got:', finalRequestBody.replica_id)
      // Force correct value
      finalRequestBody.replica_id = HARDCODED_REPLICA_ID
    }
    
    // Verify no unexpected persona/replica fields exist
    const allKeys = Object.keys(finalRequestBody)
    const unexpectedPersonaFields = allKeys.filter(key => 
      key.includes('persona') && key !== 'persona_id'
    )
    const unexpectedReplicaFields = allKeys.filter(key => 
      key.includes('replica') && key !== 'replica_id'
    )
    
    if (unexpectedPersonaFields.length > 0) {
      console.error('[create-conversation] ❌ CRITICAL ERROR: Unexpected persona fields found:', unexpectedPersonaFields)
      unexpectedPersonaFields.forEach(field => delete finalRequestBody[field])
    }
    
    if (unexpectedReplicaFields.length > 0) {
      console.error('[create-conversation] ❌ CRITICAL ERROR: Unexpected replica fields found:', unexpectedReplicaFields)
      unexpectedReplicaFields.forEach(field => delete finalRequestBody[field])
    }
    
    // Check nested properties object
    if (finalRequestBody.properties) {
      const propKeys = Object.keys(finalRequestBody.properties)
      if (propKeys.includes('persona_id') || propKeys.includes('replica_id')) {
        console.error('[create-conversation] ❌ CRITICAL ERROR: persona_id or replica_id found in properties object!')
        delete finalRequestBody.properties.persona_id
        delete finalRequestBody.properties.replica_id
      }
    }
    
    // Create JSON string from validated object
    const requestBodyString = JSON.stringify(finalRequestBody)
    
    // Final verification that string contains correct IDs
    if (!requestBodyString.includes(HARDCODED_PERSONA_ID)) {
      console.error('[create-conversation] ❌ CRITICAL ERROR: persona_id missing from JSON string!')
      throw new Error('persona_id validation failed - missing from request body')
    }
    if (!requestBodyString.includes(HARDCODED_REPLICA_ID)) {
      console.error('[create-conversation] ❌ CRITICAL ERROR: replica_id missing from JSON string!')
      throw new Error('replica_id validation failed - missing from request body')
    }
    
    // Verify string does NOT contain any other persona/replica IDs
    const personaIdPattern = /"persona_id"\s*:\s*"([^"]+)"/g
    const matches = [...requestBodyString.matchAll(personaIdPattern)]
    if (matches.length > 0) {
      const foundPersonaId = matches[0][1]
      if (foundPersonaId !== HARDCODED_PERSONA_ID) {
        console.error('[create-conversation] ❌ CRITICAL ERROR: Wrong persona_id in JSON string!')
        console.error('[create-conversation] Expected:', HARDCODED_PERSONA_ID)
        console.error('[create-conversation] Found in string:', foundPersonaId)
        throw new Error(`persona_id validation failed - found ${foundPersonaId} instead of ${HARDCODED_PERSONA_ID}`)
      }
    }
    
    console.log('[create-conversation] ✅ Final validation passed')
    console.log('[create-conversation] Request body string (first 300 chars):', requestBodyString.substring(0, 300))
    console.log('[create-conversation] Request body contains persona_id:', requestBodyString.includes(HARDCODED_PERSONA_ID))
    console.log('[create-conversation] Request body contains replica_id:', requestBodyString.includes(HARDCODED_REPLICA_ID))

    // Make request to Tavus API
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: requestBodyString
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[create-conversation] Tavus API error:', response.status, errorText)
      return res.status(response.status).json({ 
        error: 'Failed to create conversation',
        details: errorText
      })
    }

    const data = await response.json()
    
    // Log full response for debugging
    console.log('[create-conversation] ==========================================')
    console.log('[create-conversation] Tavus API response:', JSON.stringify(data, null, 2))
    console.log('[create-conversation] ==========================================')
    
    // Check if response contains persona_id and compare
    if (data.persona_id) {
      if (data.persona_id !== HARDCODED_PERSONA_ID) {
        console.error('[create-conversation] ⚠️ WARNING: Tavus returned different persona_id!')
        console.error('[create-conversation] Sent:', HARDCODED_PERSONA_ID)
        console.error('[create-conversation] Received:', data.persona_id)
      } else {
        console.log('[create-conversation] ✓ Persona ID matches:', data.persona_id)
      }
    }
    
    if (data.replica_id) {
      if (data.replica_id !== HARDCODED_REPLICA_ID) {
        console.error('[create-conversation] ⚠️ WARNING: Tavus returned different replica_id!')
        console.error('[create-conversation] Sent:', HARDCODED_REPLICA_ID)
        console.error('[create-conversation] Received:', data.replica_id)
      } else {
        console.log('[create-conversation] ✓ Replica ID matches:', data.replica_id)
      }
    }
    
    const conversationUrl = data.conversation_url || data.url
    const conversationId = data.conversation_id || data.id
    
    console.log('[create-conversation] Conversation created - URL:', conversationUrl, 'ID:', conversationId)
    console.log('[create-conversation] Replica should automatically join Daily room when conversation is created')
    
    return res.status(200).json({
      conversation_url: conversationUrl,
      conversation_id: conversationId
    })
  } catch (error) {
    console.error('[create-conversation] Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    })
  }
}

