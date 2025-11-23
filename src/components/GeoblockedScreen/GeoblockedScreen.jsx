import { Background } from '../Background/Background'
import { Header } from '../Header/Header'
import { Footer } from '../Footer/Footer'
import styles from './GeoblockedScreen.module.css'

export const GeoblockedScreen = () => {
  return (
    <div className="app">
      <Background />
      
      <Header />
      
      <div className={styles.geoblockedContent}>
        <div className={styles.errorMessage}>
          <h1 className={styles.errorTitle}>Sorry, this service is not available in your region</h1>
          <p className={styles.errorDescription}>
          </p>
        </div>
      </div>

      <Footer />
    </div>
  )
}

