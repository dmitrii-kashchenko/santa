import { useState, useEffect } from 'react'
import { getRandomGreeting } from '../utils/santaGreetings'

/**
 * Custom hook for generating Tavus conversation URL
 * Starts preloading when window is visible to optimize join times
 */
export const useTavusConversation = (isAnswered, shouldPreload = false) => {
  const [conversationUrl, setConversationUrl] = useState(null)
  const [conversationId, setConversationId] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)

  // Reset conversationUrl and conversationId when call is not answered
  useEffect(() => {
    if (!isAnswered) {
      setConversationUrl(null)
      setConversationId(null)
      setIsGenerating(false)
      setError(null)
    }
  }, [isAnswered])

  useEffect(() => {
    // Start generating if we should preload (window visible) or if call is answered
    // Only generate once - if already generating or already have URL, skip
    if ((shouldPreload || isAnswered) && !conversationUrl && !isGenerating) {
      console.log('[useTavusConversation] Starting conversation generation (preload:', shouldPreload, 'answered:', isAnswered, ')')
      setIsGenerating(true)
      const generateConversationUrl = async () => {
        try {
          const customGreeting = getRandomGreeting()
          console.log('[useTavusConversation] Selected greeting language:', customGreeting.substring(0, 50) + '...')

          console.log('[useTavusConversation] Making API request to serverless function...')
          
          // Call serverless function instead of Tavus API directly
          const response = await fetch('/api/create-conversation', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              custom_greeting: customGreeting
            })
          })

          console.log('[useTavusConversation] API Response status:', response.status)
          
          if (response.ok) {
            const data = await response.json()
            console.log('[useTavusConversation] API Response data:', data)
            const url = data.conversation_url
            const id = data.conversation_id
            console.log('[useTavusConversation] Setting conversation URL:', url)
            console.log('[useTavusConversation] Setting conversation ID:', id)
            if (url) {
              setConversationUrl(url)
            } else {
              console.error('[useTavusConversation] No conversation_url in response:', data)
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
            
            // Handle 400 status code (max concurrent users)
            if (response.status === 400) {
              setError('maxConcurrency')
            } else {
              setError('unknown')
            }
          }
        } catch (error) {
          console.error('[useTavusConversation] Error generating conversation URL:', error)
          console.error('[useTavusConversation] Error stack:', error.stack)
          setError('unknown')
        } finally {
          setIsGenerating(false)
        }
      }

      generateConversationUrl()
    }
  }, [isAnswered, shouldPreload, conversationUrl, isGenerating])

  return { conversationUrl, conversationId, error }
}

