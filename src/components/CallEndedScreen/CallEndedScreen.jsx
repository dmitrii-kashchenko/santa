import { useTranslation } from '../../utils/translations'
import { ASSET_PATHS } from '../../utils/assetPaths'
import { useSound } from '../../contexts/SoundContext'
import styles from './CallEndedScreen.module.css'

export const CallEndedScreen = ({ onContinue, selectedLanguage = 'en' }) => {
  const t = useTranslation(selectedLanguage)

  return (
    <div className={styles.callEndedContainer}>
      <section>
        <h1>Santa LOVED talking with you</h1>
        <p>Keep the holiday magic going. Make Santa your PAL and continue talking to Santa in ANY modality, text, call, or face-to-face. He remembers your conversations, reaches out on his own, and even searches the internet to help you find the perfect gift.</p>
        <a href="http://platform.tavus.io/auth/sign-up?source=santa_demo">
          Register for free
        </a>
        <span className={styles.shareRowDivider}>Or share to…</span>
        <div>
          <a href="">
            <img src={ASSET_PATHS.icons.xIcon} alt="Share to X" />
          </a>
          <a href="">
            <img src={ASSET_PATHS.icons.linkedinIcon} alt="Share to LinkedIn" />
          </a>
          <a href="">
            <img src={ASSET_PATHS.icons.facebookIcon} alt="Share to Facebook" />
          </a>
        </div>
      </section>
      
      <figure>
        <img src={ASSET_PATHS.images.postcardStamp} alt="" aria-hidden="true" className={styles.stampImage} />
        <img src={ASSET_PATHS.images.lastSanta} alt="The artist formerly known as Santa" className={styles.santaImage} />
      </figure>
    </div>
  )
}