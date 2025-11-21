import { useState, useRef } from 'react'
import './App.css'
import { useAssetPreloader } from './hooks/useAssetPreloader'
import { useTavusConversation } from './hooks/useTavusConversation'
import { useGeoblock } from './hooks/useGeoblock'
import { LoadingScreen } from './components/LoadingScreen/LoadingScreen'
import { GeoblockScreen } from './components/GeoblockScreen/GeoblockScreen'
import { Background } from './components/Background/Background'
import { Header } from './components/Header/Header'
import { HeroText } from './components/HeroText/HeroText'
import { Footer } from './components/Footer/Footer'
import { WindowIcon } from './components/WindowIcon/WindowIcon'
import { VideoCallWindow } from './components/VideoCallWindow/VideoCallWindow'
import { FlappyWindow } from './components/FlappyWindow/FlappyWindow'
import { ASSET_PATHS } from './utils/assetPaths'

function App() {
  const isLoading = useAssetPreloader()
  const { isBlocked, isChecking, locationData } = useGeoblock()
  const [isMinimized, setIsMinimized] = useState(false)
  const [isFlappyMinimized, setIsFlappyMinimized] = useState(true)
  const [isAnswered, setIsAnswered] = useState(false)
  const [isHairCheckComplete, setIsHairCheckComplete] = useState(false)
  const [isCallEnded, setIsCallEnded] = useState(false)
  const windowRef = useRef(null)
  const flappyWindowRef = useRef(null)

  const { conversationUrl, conversationId } = useTavusConversation(isAnswered)

  const handleSantaIconClick = () => {
    if (isMinimized) {
      setIsFlappyMinimized(true)
    }
    setIsMinimized(!isMinimized)
  }

  const handleFlappyIconClick = () => {
    if (isFlappyMinimized) {
      setIsMinimized(true)
    }
    setIsFlappyMinimized(!isFlappyMinimized)
  }

  const handleCallEndedContinue = () => {
    setIsCallEnded(false)
    setIsHairCheckComplete(false)
    setIsAnswered(false)
  }

  // Show loading screen
  if (isLoading || isChecking) {
    return <LoadingScreen />
  }

  // Show geoblock screen if user is in US
  if (isBlocked) {
    return <GeoblockScreen />
  }

  return (
    <div className="app">
      <Background />
      
      <Header />
      
      <HeroText />

      <Footer />

      <main className="main-content">
        <WindowIcon
          icon={ASSET_PATHS.images.santa}
          title="SANTA"
          isOpen={!isMinimized}
          onClick={handleSantaIconClick}
        />

        <WindowIcon
          icon={ASSET_PATHS.images.elf}
          title="FLAPPY ELF"
          isOpen={!isFlappyMinimized}
          onClick={handleFlappyIconClick}
          position="flappy"
        />
      </main>

      <VideoCallWindow
        isLoading={isLoading}
        isMinimized={isMinimized}
        setIsMinimized={setIsMinimized}
        isAnswered={isAnswered}
        setIsAnswered={setIsAnswered}
        isHairCheckComplete={isHairCheckComplete}
        setIsHairCheckComplete={setIsHairCheckComplete}
        conversationUrl={conversationUrl}
        conversationId={conversationId}
        isCallEnded={isCallEnded}
        setIsCallEnded={setIsCallEnded}
        windowRef={windowRef}
        locationData={locationData}
      />

      <FlappyWindow
        isMinimized={isFlappyMinimized}
        setIsMinimized={setIsFlappyMinimized}
        windowRef={flappyWindowRef}
      />
    </div>
  )
}

export default App
