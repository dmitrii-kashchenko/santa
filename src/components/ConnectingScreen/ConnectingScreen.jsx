import { useTranslation } from '../../utils/translations'
import { ASSET_PATHS } from '../../utils/assetPaths'
import styles from './ConnectingScreen.module.css'

export const ConnectingScreen = ({ error, selectedLanguage = 'en' }) => {
  const t = useTranslation(selectedLanguage)
  
  const getMessage = () => {
    if (error === 'dailyLimitReached') {
      return t('santaWorkshopError')
    }
    if (error === 'maxConcurrency') {
      return t('santaBusyError')
    }
    if (error === 'apiError') {
      return t('unableToConnect')
    }
    if (error === 'unknown') {
      return t('connectionError')
    }
    return t('connectingToNorthPole')
  }

  return (
    <div className={styles.connectingScreenContainer}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className={styles.connectingScreenVideo}
      >
        <source src={ASSET_PATHS.videos.northPole} type="video/mp4" />
      </video>
      <div className={`${styles.connectingScreenText} ${error ? styles.errorText : ''}`}>
        {console.log('[ConnectingScreen] No conversationUrl, showing message:', error || 'loading')}
        {getMessage()}
      </div>
    </div>
  )
}

