import { useTranslation } from '../../utils/translations'
import { ASSET_PATHS } from '../../utils/assetPaths'
import styles from './CallEndedScreen.module.css'

export const CallEndedScreen = ({ onContinue, selectedLanguage = 'en' }) => {
  const t = useTranslation(selectedLanguage)
  
  return (
    <div className={styles.callEndedContainer}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className={styles.callEndedBackgroundVideo}
      >
        <source src={ASSET_PATHS.videos.northPole} type="video/mp4" />
      </video>
      <div className={styles.callEndedContent}>
        <h1 className={styles.callEndedTitle}>
          {t('santaIsNowPal')}
        </h1>
        <p className={styles.callEndedSubtext}>
          {t('santaPalDescription')}
        </p>
        <button
          className={styles.callEndedCta}
          onClick={onContinue}
        >
          {t('continueConversation')}
        </button>
      </div>
    </div>
  )
}

