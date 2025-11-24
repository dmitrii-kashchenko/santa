import { useState, useEffect } from 'react'
import FlappySantaMobile from './FlappySantaMobile'
import FlappySantaDesktop from './FlappySantaDesktop'

const FlappySanta = ({ selectedLanguage = 'en' }) => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth <= 768)
    }

    // Check on mount
    checkMobile()

    // Listen for resize events
    window.addEventListener('resize', checkMobile)
    window.addEventListener('orientationchange', checkMobile)

    return () => {
      window.removeEventListener('resize', checkMobile)
      window.removeEventListener('orientationchange', checkMobile)
    }
  }, [])

  // Render the appropriate component based on device type
  return isMobile ? (
    <FlappySantaMobile selectedLanguage={selectedLanguage} />
  ) : (
    <FlappySantaDesktop selectedLanguage={selectedLanguage} />
  )
}

export default FlappySanta


