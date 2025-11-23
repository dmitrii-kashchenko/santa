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
    const usageStorage = await import('./usage-storage.js')
    const { getOrCreateUserId } = await import('./cookie-utils.js')
    
    // Get user identifier from cookie (generates new one if doesn't exist)
    const identifier = getOrCreateUserId(req, res)
    
    const usage = usageStorage.getUsage(identifier)
    const canStart = usageStorage.canStartSession(identifier)
    
    console.log('[check-usage] User:', identifier.substring(0, 20) + '...', 'Used:', usage.usedSeconds, 'Remaining:', usage.remainingSeconds, 'Can start:', canStart)
    
    return res.status(200).json({
      canStart,
      remainingSeconds: usage.remainingSeconds,
      usedSeconds: usage.usedSeconds,
      maxDailySeconds: usageStorage.MAX_DAILY_SECONDS
    })
  } catch (error) {
    console.error('[check-usage] Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    })
  }
}

