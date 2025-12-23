import { useTranslation } from '../../utils/translations'
import { ASSET_PATHS } from '../../utils/assetPaths'
import { useSound } from '../../contexts/SoundContext'
import styles from './CallEndedScreen.module.css'

export const CallEndedScreen = ({ onContinue, selectedLanguage = 'en' }) => {
  const t = useTranslation(selectedLanguage)

  return (
    <div className={styles.callEndedContainer}>
      <section>
        <h1>Спасибо за чудесный разговор</h1>
        <p>Теперь Санта должен уделить время и другим хорошим мальчикам и девочкам</p>
        <a href="https://www.dny2026.digital" target="_blank" rel="noopener noreferrer">
          Вернуться на сайт
        </a>
      </section>
      
      <figure>
        <img src={ASSET_PATHS.images.postcardStamp} alt="" aria-hidden="true" className={styles.stampImage} />
        <img src={ASSET_PATHS.images.lastSanta} alt="The artist formerly known as Bad Santa" className={styles.santaImage} />
      </figure>
    </div>
  )
}
