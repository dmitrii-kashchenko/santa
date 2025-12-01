import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { CVIProvider } from './components/cvi/components/cvi-provider'
import { NaughtyNiceTest } from './components/NaughtyNiceTest/NaughtyNiceTest'
import { SoundProvider } from './contexts/SoundContext'

// Initialize BotID client-side protection (only in production and only if configured)
// BotID client-side can interfere with fetch requests if not properly configured
// So we only initialize it if we can verify it's set up correctly
// In development, BotID is disabled to avoid console warnings
if (import.meta.env.PROD) {
  // Handle script loading errors from BotID gracefully
  const originalErrorHandler = window.onerror
  window.onerror = function(message, source, lineno, colno, error) {
    // Suppress BotID script loading errors (non-critical)
    if (source && (source.includes('botid') || source.includes('c.js'))) {
      console.warn('[BotID] Script loading error (suppressed, non-critical):', source)
      return true // Suppress the error
    }
    // Call original error handler for other errors
    if (originalErrorHandler) {
      return originalErrorHandler.call(this, message, source, lineno, colno, error)
    }
    return false
  }
  
  // Only initialize BotID if we can verify it's configured
  // Check if BOTID_SECRET is likely set by trying to make a test request
  // For now, we'll skip BotID client-side initialization to avoid blocking requests
  // BotID server-side protection will still work if BOTID_SECRET is configured
  console.log('[BotID] BotID client-side protection disabled - using server-side only')
  // BotID client-side can block fetch requests if not properly configured
  // Server-side BotID protection in api/create-conversation.js will still work
} else {
  console.log('[BotID] BotID disabled in development mode')
}

const isDev = import.meta.env.DEV;
const isTestRoute = window.location.pathname === '/test/naughty-nice';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SoundProvider>
      <CVIProvider>
        {isDev && isTestRoute ? <NaughtyNiceTest /> : <App />}
      </CVIProvider>
    </SoundProvider>
  </StrictMode>,
)
