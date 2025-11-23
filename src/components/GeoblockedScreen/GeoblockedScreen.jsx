import { useTranslation } from '../../utils/translations'
import { Background } from '../Background/Background'
import { Header } from '../Header/Header'
import { Footer } from '../Footer/Footer'
import styles from './GeoblockedScreen.module.css'

export const GeoblockedScreen = ({ selectedLanguage = 'en' }) => {
  const t = useTranslation(selectedLanguage)
  
  return (
    <div className="app">
      <Background />
      
      <Header />
      
      <div className={styles.geoblockedContent}>
        <div className={styles.errorMessage}>
          <h1 className={styles.errorTitle}>{t('geoblockedTitle')}</h1>
          <p className={styles.errorDescription}>
          </p>
        </div>
      </div>

      <Footer selectedLanguage={selectedLanguage} onLanguageChange={() => {}} />
    </div>
  )
}

