import { useTranslation } from '../../utils/translations'
import styles from './LoadingScreen.module.css'

export const LoadingScreen = ({ selectedLanguage = 'en' }) => {
  const t = useTranslation(selectedLanguage)
  
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <div className={styles.loadingSpinner}></div>
        <div className={styles.loadingText}>{t('loading')}</div>
      </div>
    </div>
  )
}

