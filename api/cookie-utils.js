// Utility functions for managing user ID cookies

function generateUserId() {
  // Generate a simple unique ID (not cryptographically secure, but sufficient for usage tracking)
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
}

export function getOrCreateUserId(req, res) {
  const cookieName = 'santa_user_id'
  
  // Parse cookies from request with better error handling
  let cookies = {}
  try {
    if (req.headers.cookie) {
      cookies = req.headers.cookie.split(';').reduce((acc, cookie) => {
    const trimmed = cookie.trim()
        if (!trimmed) return acc
        
    const equalIndex = trimmed.indexOf('=')
    if (equalIndex > 0) {
          const key = trimmed.substring(0, equalIndex).trim()
          const value = trimmed.substring(equalIndex + 1).trim()
      if (key && value) {
            try {
        acc[key] = decodeURIComponent(value)
            } catch (e) {
              // If decoding fails, use raw value
              acc[key] = value
            }
      }
    }
    return acc
      }, {})
    }
  } catch (error) {
    console.warn('[cookie-utils] Failed to parse cookies:', error.message)
    cookies = {}
  }
  
  let userId = cookies[cookieName]
  
  // If no user ID exists, generate one and set it in a cookie
  if (!userId) {
    userId = generateUserId()
    
    // Set httpOnly cookie for security (prevents client-side JavaScript access)
    // SameSite=Lax allows cookies to be sent in top-level navigations (better than Strict)
    // Secure flag should be set in production (HTTPS only)
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieOptions = [
      `${cookieName}=${encodeURIComponent(userId)}`,
      'HttpOnly',
      'SameSite=Lax',
      'Path=/',
      `Max-Age=${60 * 60 * 24 * 365}`, // 1 year
      ...(isProduction ? ['Secure'] : [])
    ].join('; ')
    
    res.setHeader('Set-Cookie', cookieOptions)
    console.log('[cookie-utils] Created new user ID:', userId.substring(0, 20) + '...')
  } else {
    console.log('[cookie-utils] Using existing user ID:', userId.substring(0, 20) + '...')
  }
  
  return userId
}

