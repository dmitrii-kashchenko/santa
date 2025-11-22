import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initBotId } from 'botid/client/core'
import './index.css'
import App from './App.jsx'
import { CVIProvider } from './components/cvi/components/cvi-provider'
import { NaughtyNiceTest } from './components/NaughtyNiceTest/NaughtyNiceTest'

// Initialize BotID client-side protection
initBotId({
  protect: [
    {
      path: '/api/create-conversation',
      method: 'POST',
    },
  ],
})

const isDev = import.meta.env.DEV;
const isTestRoute = window.location.pathname === '/test/naughty-nice';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CVIProvider>
      {isDev && isTestRoute ? <NaughtyNiceTest /> : <App />}
    </CVIProvider>
  </StrictMode>,
)
