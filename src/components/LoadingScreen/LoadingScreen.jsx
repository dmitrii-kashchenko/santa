import { useTranslation } from '../../utils/translations'
import styles from './LoadingScreen.module.css'

export const LoadingScreen = ({ selectedLanguage = 'en' }) => {
  const t = useTranslation(selectedLanguage)
  
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <img 
          src="/snowflake.png" 
          alt="Loading" 
          className={styles.snowflakeIcon}
        />
        <div className={styles.loadingText}>{t('loadingHolidayMagic')}</div>
      </div>
    </div>
  )
}

