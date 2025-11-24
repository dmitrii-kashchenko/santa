import { useTranslation } from '../../utils/translations'
import styles from './HeroText.module.css'

export const HeroText = ({ selectedLanguage = 'en' }) => {
  const t = useTranslation(selectedLanguage)
  
  return (
    <div className={styles.heroText}>
      <span className={styles.heroTextMeet}>{t('heroMeet')}</span>
    </div>
  )
}

