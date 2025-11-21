import { useState, useEffect } from 'react'
import { getRandomGreeting } from '../utils/santaGreetings'

/**
 * Custom hook for generating Tavus conversation URL
 * Starts initializing when call is answered so it's ready by the time user joins
 */
export const useTavusConversation = (isAnswered) => {
  const [conversationUrl, setConversationUrl] = useState(null)
  const [conversationId, setConversationId] = useState(null)

  // Reset conversationUrl and conversationId when call is not answered
  useEffect(() => {
    if (!isAnswered) {
      setConversationUrl(null)
      setConversationId(null)
    }
  }, [isAnswered])

  useEffect(() => {
    if (isAnswered && !conversationUrl) {
      console.log('[useTavusConversation] Call answered, generating conversation URL...')
      const generateConversationUrl = async () => {
        try {
          // Try multiple ways to get the API key
          const apiKey = import.meta.env.VITE_TAVUS_API_KEY || 
                        import.meta.env.TAVUS_API_KEY ||
                        'a1e1daafc143449b8c8c07dea5a56482' // Fallback to hardcoded key
          
          console.log('[useTavusConversation] API Key exists:', !!apiKey)
          console.log('[useTavusConversation] API Key value (first 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'none')
          console.log('[useTavusConversation] All env vars:', Object.keys(import.meta.env).filter(k => k.includes('TAVUS')))
          
          if (!apiKey) {
            console.error('[useTavusConversation] Tavus API key not found')
            return
          }

          const customGreeting = getRandomGreeting()
          console.log('[useTavusConversation] Selected greeting language:', customGreeting.substring(0, 50) + '...')

          console.log('[useTavusConversation] Making API request to Tavus...')
          const requestBody = {
            persona_id: 'pe6534e5245c',
            replica_id: 'r69a7ee6ca38',
            conversation_name: 'Santa Call',
            custom_greeting: customGreeting
          }
          console.log('[useTavusConversation] Request body:', requestBody)
          
          // Generate conversation URL using Tavus API
          const response = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': apiKey
            },
            body: JSON.stringify(requestBody)
          })

          console.log('[useTavusConversation] API Response status:', response.status)
          console.log('[useTavusConversation] API Response headers:', Object.fromEntries(response.headers.entries()))
          
          if (response.ok) {
            const data = await response.json()
            console.log('[useTavusConversation] API Response data:', data)
            const url = data.conversation_url || data.url
            const id = data.conversation_id || data.id
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
            const errorText = await response.text()
            console.error('[useTavusConversation] Failed to generate conversation URL:', response.status, errorText)
            try {
              const errorJson = JSON.parse(errorText)
              console.error('[useTavusConversation] Error details:', errorJson)
            } catch (e) {
              // Not JSON, already logged as text
            }
          }
        } catch (error) {
          console.error('[useTavusConversation] Error generating conversation URL:', error)
          console.error('[useTavusConversation] Error stack:', error.stack)
        }
      }

      generateConversationUrl()
    }
  }, [isAnswered, conversationUrl])

  return { conversationUrl, conversationId }
}

