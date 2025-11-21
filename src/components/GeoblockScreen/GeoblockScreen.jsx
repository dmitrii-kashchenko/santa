import { ASSET_PATHS } from '../../utils/assetPaths'
import styles from './GeoblockScreen.module.css'

export const GeoblockScreen = () => {
  return (
    <div className={styles.geoblockContainer}>
      <video
        autoPlay
        loop
        muted
        playsInline
        className={styles.geoblockBackgroundVideo}
      >
        <source src={ASSET_PATHS.videos.northPole} type="video/mp4" />
      </video>
      <div className={styles.geoblockContent}>
        <h1 className={styles.geoblockTitle}>
          Access Restricted
        </h1>
        <p className={styles.geoblockSubtext}>
          This service is not available in your region.
        </p>
      </div>
    </div>
  )
}

