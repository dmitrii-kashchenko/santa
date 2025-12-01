import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '../../utils/translations'
import { useWindowPosition } from '../../hooks/useWindowPosition'
import { useSound } from '../../contexts/SoundContext'
import { HairCheck } from '../cvi/components/hair-check'
import { Conversation } from '../cvi/components/conversation'
import { CallControls } from '../CallControls/CallControls'
import { CallEndedScreen } from '../CallEndedScreen/CallEndedScreen'
import { ConnectingScreen } from '../ConnectingScreen/ConnectingScreen'
import styles from './VideoCallWindow.module.css'

export const VideoCallWindow = ({
  isLoading,
  isMinimized,
  setIsMinimized,
  isAnswered,
  setIsAnswered,
  isHairCheckComplete,
  setIsHairCheckComplete,
  conversationUrl,
  conversationId,
  error,
  isCallEnded,
  setIsCallEnded,
  windowRef,
  selectedLanguage,
  onLanguageChange
}) => {
  const [showIntroVideo, setShowIntroVideo] = useState(true)
  const [countdown, setCountdown] = useState(180)
  const conversationRef = useRef(null)
  const timerIntervalRef = useRef(null)
  const [isReplicaReady, setIsReplicaReady] = useState(false)
  const hasEndedOnExitRef = useRef(false)
  const t = useTranslation(selectedLanguage)
  const { playButtonClick } = useSound()

  const { position, windowSize, isDragging, handleDragStart, shouldBeFullscreen } = useWindowPosition({
    isLoading,
    isMinimized,
    isAnswered,
    windowRef
  })

  const handleIntroVideoEnd = () => {
    console.log('Intro video ended, switching to loop video')
    setShowIntroVideo(false)
  }

  const handleAnswer = () => {
    setIsAnswered(true)
  }

  const handleCancel = () => {
    setIsAnswered(false)
    setIsReplicaReady(false)
    // Cleanup timer when cancelling
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setCountdown(180)
  }

  const handleJoin = () => {
    setIsHairCheckComplete(true)
  }


  const handleCallEndedContinue = () => {
    setIsCallEnded(false)
    setIsHairCheckComplete(false)
    setIsAnswered(false)
    setIsReplicaReady(false)
    // Reset timer
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setCountdown(180)
    window.location.assign('https://platform.tavus.io/auth/sign-up?source=santa_demo')
  }

  const handleReplicaReady = () => {
    console.log('[VideoCallWindow] Replica ready callback received')
    setIsReplicaReady(true)
  }

  // Initialize timer when replica is ready (not during haircheck)
  useEffect(() => {
    // Only start timer if all conditions are met and timer isn't already running
    if (isReplicaReady && !timerIntervalRef.current && isAnswered && isHairCheckComplete && !isCallEnded) {
      // Set countdown to 3 minutes (180 seconds)
      setCountdown(180)
      console.log('[VideoCallWindow] Replica is ready - starting timer with 3 minute countdown (180 seconds)')
      console.log('[VideoCallWindow] Timer conditions:', { isReplicaReady, isAnswered, isHairCheckComplete, isCallEnded })
      
      // Start countdown timer
      timerIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          const newValue = prev <= 1 ? 0 : prev - 1
          if (newValue % 10 === 0 || newValue <= 10) {
            console.log(`[VideoCallWindow] Countdown: ${newValue} seconds remaining`)
          }
          if (newValue === 0) {
            console.log('[VideoCallWindow] Countdown reached 0 - call should end')
            // Clear interval when countdown reaches 0
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current)
              timerIntervalRef.current = null
            }
          }
          return newValue
        })
      }, 1000)
      
      console.log('[VideoCallWindow] Timer interval started')
    } else if (isReplicaReady && timerIntervalRef.current) {
      console.log('[VideoCallWindow] Timer already running, skipping setup')
    } else {
      console.log('[VideoCallWindow] Timer not started - conditions:', { isReplicaReady, isAnswered, isHairCheckComplete, isCallEnded, hasTimer: !!timerIntervalRef.current })
    }
  }, [isReplicaReady, isAnswered, isHairCheckComplete, isCallEnded])

  // Cleanup timer when call ends or is cancelled
  useEffect(() => {
    if (!isAnswered || isCallEnded) {
      if (timerIntervalRef.current) {
        console.log('[VideoCallWindow] Cleaning up timer - call ended or cancelled')
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [isAnswered, isCallEnded])

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }
  }, [])

  const handleConversationLeave = () => {
    console.log('[VideoCallWindow] Conversation onLeave called')
    setIsCallEnded(true)
  }

  // End call when user closes tab/browser or device shuts down
  // Note: Tab switching no longer ends the call - user can switch tabs freely
  useEffect(() => {
    // Reset the exit flag when call state changes
    if (!isAnswered || !isHairCheckComplete) {
      hasEndedOnExitRef.current = false
      return
    }

    // Only set up listeners if call is active
    if (isCallEnded) {
      hasEndedOnExitRef.current = false
      return
    }

    const endCallOnExit = () => {
      // Prevent multiple calls to end using ref (avoids stale closure issues)
      if (hasEndedOnExitRef.current) {
        return
      }
      hasEndedOnExitRef.current = true
      console.log('[VideoCallWindow] User closing tab/browser or device shutting down - ending call')
      if (conversationRef.current && conversationRef.current.end) {
        conversationRef.current.end()
      } else {
        handleConversationLeave()
      }
    }

    // Handle page unload (most reliable for device shutdown, app closure, tab closure)
    // This fires when the page is being unloaded, including when device is turned off
    const handlePageHide = (e) => {
      // e.persisted is false when page is being unloaded (not just cached)
      // This catches device shutdown, browser closure, tab closure
      if (!e.persisted) {
        endCallOnExit()
      }
    }

    // Handle before unload (desktop browsers, tab closure)
    const handleBeforeUnload = () => {
      endCallOnExit()
    }

    // Handle freeze event (mobile devices - fires when device is about to freeze/sleep)
    // This is especially important for mobile devices being turned off or going to sleep
    // Part of Page Lifecycle API (may not be supported in all browsers)
    const handleFreeze = () => {
      endCallOnExit()
    }

    // Add event listeners
    // Note: visibilitychange is NOT included - tab switching no longer ends the call
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('beforeunload', handleBeforeUnload)
    // Freeze event for mobile device shutdown/sleep (Page Lifecycle API)
    // Note: May not be supported in all browsers, but pagehide should catch device shutdown
    if ('onfreeze' in document) {
      document.addEventListener('freeze', handleFreeze)
    }
    if ('onfreeze' in window) {
      window.addEventListener('freeze', handleFreeze)
    }

    // Cleanup
    return () => {
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if ('onfreeze' in document) {
        document.removeEventListener('freeze', handleFreeze)
      }
      if ('onfreeze' in window) {
        window.removeEventListener('freeze', handleFreeze)
      }
    }
  }, [isAnswered, isHairCheckComplete, isCallEnded])

  const handleClose = (e) => {
    e.stopPropagation()
    playButtonClick()
    // If call is active, end it (not just leave) and close window
    if (isAnswered && isHairCheckComplete && !isCallEnded) {
      // End the call (ends for all participants, not just leave)
      if (conversationRef.current && conversationRef.current.end) {
        conversationRef.current.end()
      } else {
        // Fallback: just set call ended
        handleConversationLeave()
      }
    }
    // Always minimize/close the window
    setIsMinimized(true)
  }

  if (isMinimized) {
    return null
  }

  return (
    <div 
      ref={windowRef}
      className={`${styles.videoCallWindow} ${isAnswered ? styles.windowAnswered : ''} ${shouldBeFullscreen ? styles.mobileFullscreen : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'none',
        ...(windowSize && !isAnswered && !shouldBeFullscreen && window.innerWidth <= 768 ? {
          width: `${windowSize.width}px`,
          height: `${windowSize.height}px`
        } : {})
      }}
    >
      <div 
        className={styles.windowTitleBar}
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className={styles.titleBarLeft}>
          <span className={styles.titleIcon}></span>
          <span className={styles.titleText}>{t('santa')}</span>
        </div>
        <div className={styles.titleBarRight}>
          <div className={styles.menuLines}></div>
          <span 
            className={styles.windowControl}
            onClick={handleClose}
          >
            <img src="/close_button.svg" alt="Close" className={styles.windowControlInner} />
          </span>
        </div>
      </div>
      
      <div className={styles.videoFeed}>
        {!isAnswered ? (
          <CallControls 
            onAnswer={handleAnswer}
            showIntroVideo={showIntroVideo}
            onIntroVideoEnd={handleIntroVideoEnd}
            selectedLanguage={selectedLanguage}
          />
        ) : (
          <div className={styles.answeredScreen}>
            {!isHairCheckComplete ? (
              <div className={styles.haircheckContainer}>
                <HairCheck
                  onJoin={handleJoin}
                  onCancel={handleCancel}
                  conversationUrl={conversationUrl}
                  conversationId={conversationId}
                  selectedLanguage={selectedLanguage}
                />
              </div>
            ) : isCallEnded ? (
              <CallEndedScreen onContinue={handleCallEndedContinue} selectedLanguage={selectedLanguage} />
            ) : (
              <div className={styles.conversationContainer}>
                {conversationUrl ? (
                  <>
                    {console.log('[VideoCallWindow] Rendering Conversation component with URL:', conversationUrl)}
                    <Conversation 
                      ref={conversationRef}
                      conversationUrl={conversationUrl}
                      conversationId={conversationId}
                      onLeave={handleConversationLeave}
                      selectedLanguage={selectedLanguage}
                      shouldJoin={isHairCheckComplete}
                      countdown={countdown}
                      setCountdown={setCountdown}
                      onReplicaReady={handleReplicaReady}
                    />
                  </>
                ) : (
                  <ConnectingScreen error={error} selectedLanguage={selectedLanguage} />
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

