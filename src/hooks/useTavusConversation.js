import { useState, useEffect } from 'react'
import { getRandomGreeting } from '../utils/santaGreetings'

/**
 * Custom hook for generating Tavus conversation URL
 * Starts preloading when window is visible to optimize join times
 */
export const useTavusConversation = (isAnswered, shouldPreload = false, selectedLanguage = 'en', isConversationStarted = false) => {
  const [conversationUrl, setConversationUrl] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [lastLanguage, setLastLanguage] = useState(selectedLanguage)

  // Reset conversationUrl and conversationId when call is not answered
  useEffect(() => {
    if (!isAnswered) {
      setConversationUrl(null)
      setConversationId(null)
      setIsGenerating(false)
      setError(null)
      setLastLanguage(selectedLanguage)
    }
  }, [isAnswered])

  // Reset conversation if language changes, but only if conversation hasn't started yet
  useEffect(() => {
    if (lastLanguage !== selectedLanguage && !isConversationStarted) {
      if (conversationUrl) {
        console.log('[useTavusConversation] Language changed from', lastLanguage, 'to', selectedLanguage, '- resetting conversation')
        setConversationUrl(null)
        setConversationId(null)
        setError(null)
      }
      setLastLanguage(selectedLanguage)
    } else if (lastLanguage !== selectedLanguage) {
      // Language changed but conversation already started - just update lastLanguage without resetting
      console.log('[useTavusConversation] Language changed from', lastLanguage, 'to', selectedLanguage, '- conversation already started, not resetting')
      setLastLanguage(selectedLanguage)
    }
  }, [selectedLanguage, lastLanguage, conversationUrl, isConversationStarted])

  useEffect(() => {
    // Start generating if we should preload (window visible) or if call is answered
    // Only generate once - if already generating or already have URL, skip
    // Don't retry if there's an error (prevents infinite loops)
    if ((shouldPreload || isAnswered) && !conversationUrl && !isGenerating && !error) {
      console.log('[useTavusConversation] Starting conversation generation (preload:', shouldPreload, 'answered:', isAnswered, ')')
      setIsGenerating(true)
      const generateConversationUrl = async () => {
        try {
          const customGreeting = getRandomGreeting(selectedLanguage)
          console.log('[useTavusConversation] Selected language code:', selectedLanguage)
          console.log('[useTavusConversation] Generated greeting (first 100 chars):', customGreeting.substring(0, 100) + '...')

          console.log('[useTavusConversation] Making API request to serverless function...')
          
          const apiUrl = '/api/create-conversation'
          
          // Get timezone offset (negated getTimezoneOffset for correct calculation)
          const timezoneOffset = -new Date().getTimezoneOffset();
          
          // Call serverless function instead of Tavus API directly
          // Add timeout to prevent hanging
          const controller = new AbortController()
          const timeoutId = setTimeout(() => {
            controller.abort()
            console.error('[useTavusConversation] Request timeout after 30 seconds')
          }, 30000) // 30 second timeout
          
          let response
          try {
            console.log('[useTavusConversation] Fetching:', apiUrl)
            console.log('[useTavusConversation] Request body:', { custom_greeting: customGreeting.substring(0, 50) + '...', language: selectedLanguage, timezoneOffset })
            
            response = await fetch(apiUrl, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                custom_greeting: customGreeting,
                language: selectedLanguage,
                timezoneOffset: timezoneOffset
              }),
              signal: controller.signal
            })
            clearTimeout(timeoutId)
            console.log('[useTavusConversation] API Response status:', response.status)
            console.log('[useTavusConversation] API Response ok:', response.ok)
            console.log('[useTavusConversation] API Response URL:', response.url)
          } catch (fetchError) {
            clearTimeout(timeoutId)
            console.error('[useTavusConversation] Fetch error (network/CORS/timeout):', fetchError)
            console.error('[useTavusConversation] Fetch error details:', {
              message: fetchError.message,
              stack: fetchError.stack,
              name: fetchError.name,
              isAbort: fetchError.name === 'AbortError'
            })
            
            if (fetchError.name === 'AbortError') {
              console.error('[useTavusConversation] Request was aborted (likely timeout)')
              setError('unknown')
            } else {
              setError('unknown')
            }
            setIsGenerating(false)
            return
          }
          
          if (response.ok) {
            let data
            try {
              const responseText = await response.text()
              console.log('[useTavusConversation] API Response text (first 200 chars):', responseText.substring(0, 200))
              
              // Check if response is HTML (error page) instead of JSON
              if (responseText.trim().startsWith('<!')) {
                console.error('[useTavusConversation] API returned HTML instead of JSON - likely 404 or error page')
                console.error('[useTavusConversation] Full response:', responseText)
                setError('unknown')
                setIsGenerating(false)
                return
              }
              
              data = JSON.parse(responseText)
              console.log('[useTavusConversation] API Response data:', data)
            } catch (parseError) {
              console.error('[useTavusConversation] Failed to parse API response as JSON:', parseError)
              console.error('[useTavusConversation] Response might be HTML or malformed JSON')
              setError('unknown')
              setIsGenerating(false)
              return
            }
            
            const url = data.conversation_url
            const id = data.conversation_id
            console.log('[useTavusConversation] Setting conversation URL:', url)
            console.log('[useTavusConversation] Setting conversation ID:', id)
            if (url) {
              setConversationUrl(url)
            } else {
              console.error('[useTavusConversation] No conversation_url in response:', data)
              setError('unknown')
            }
            if (id) {
              setConversationId(id)
            } else {
              console.warn('[useTavusConversation] No conversation_id in response:', data)
            }
          } else {
            const errorText = await response.text().catch(() => 'Failed to read error response')
            let errorData
            try {
              errorData = JSON.parse(errorText)
            } catch {
              errorData = { error: errorText }
            }
            console.error('[useTavusConversation] Failed to generate conversation URL:', response.status, errorData)
            
            // Handle 400 status code - check if it's max concurrency or another error
            if (response.status === 400) {
              // Parse error details - might be a JSON string that needs parsing
              let errorDetails = errorData.details || errorData.message || errorText || ''
              
              // If details is a JSON string, try to parse it
              if (typeof errorDetails === 'string') {
                try {
                  const parsedDetails = JSON.parse(errorDetails)
                  errorDetails = parsedDetails.message || parsedDetails.error || errorDetails
                } catch {
                  // Not JSON, use as-is
                }
              }
              
              // Check if it's a concurrency error
              const errorDetailsStr = String(errorDetails).toLowerCase()
              const isConcurrencyError = 
                errorDetailsStr.includes('concurrent') ||
                errorDetailsStr.includes('max') ||
                errorDetailsStr.includes('limit') ||
                errorDetailsStr.includes('capacity') ||
                errorDetailsStr.includes('busy')
              
              if (isConcurrencyError) {
                setError('maxConcurrency')
              } else {
                // Other 400 errors (like invalid persona_id, etc.)
                setError('apiError')
              }
            } else {
              setError('unknown')
            }
          }
        } catch (error) {
          console.error('[useTavusConversation] Error generating conversation URL:', error)
          console.error('[useTavusConversation] Error name:', error.name)
          console.error('[useTavusConversation] Error message:', error.message)
          console.error('[useTavusConversation] Error stack:', error.stack)
          console.error('[useTavusConversation] Full error object:', error)
          
          // Check if it's a network error
          if (error.name === 'TypeError' && error.message.includes('fetch')) {
            console.error('[useTavusConversation] Network error detected - check CORS, network connectivity, or if request was blocked')
          }
          
          setError('unknown')
        } finally {
          setIsGenerating(false)
        }
      }

      generateConversationUrl()
    }
  }, [isAnswered, shouldPreload, conversationUrl, isGenerating, selectedLanguage])

  return { conversationUrl, conversationId, error }
}

