import { useState } from 'react'
import { useLang } from '../LangContext'
import styles from './WelcomeModal.module.css'

const STORAGE_KEY = 'enlt_welcome_seen'

export function shouldShowWelcome() {
  return !localStorage.getItem(STORAGE_KEY)
}

function SearchIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/></svg>
}
function StatsIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="2" y="14" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="14" rx="1"/><rect x="18" y="3" width="4" height="19" rx="1"/></svg>
}
function SpotifyIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="#1DB954"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.622.622 0 0 1-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 0 1-.277-1.215c3.809-.87 7.077-.496 9.712 1.115.294.181.387.563.207.857zm1.224-2.724a.78.78 0 0 1-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 1 1-.453-1.492c3.632-1.102 8.147-.568 11.233 1.329a.78.78 0 0 1 .257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.937.937 0 1 1-.543-1.79c3.532-1.072 9.404-.865 13.115 1.337a.937.937 0 0 1-.954 1.608z"/></svg>
}
function ShareIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
}
function SessionIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
}

export default function WelcomeModal({ onClose }) {
  const { t } = useLang()
  const [dontShow, setDontShow] = useState(false)

  function handleClose() {
    if (dontShow) localStorage.setItem(STORAGE_KEY, '1')
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className={styles.box}>

        {/* Hero con foto de fondo */}
        <div className={styles.hero}>
          <div className={styles.heroBg} aria-hidden="true">
            <img src="/hero-1.png" alt="" className={styles.heroBgImg} />
            <div className={styles.heroBgOverlay} />
          </div>
          <div className={styles.heroTitle}>En Las Nubes Trepao</div>
          <div className={styles.heroSub}>{t('heroSubtitle')}</div>
          <div className={styles.heroTagline}>{t('welcomeTagline')}</div>
        </div>

        <div className={styles.intro}>
          {t('welcomeBody').split('\n\n').map((para, i) => (
            <p key={i} className={styles.introPara}>{para}</p>
          ))}
        </div>

        <div className={styles.collectionsRow}>
          <div className={`${styles.collCard} ${styles.collVinyl}`}>
            <div className={styles.collCardPhoto} style={{ backgroundImage: 'url(/hero-4.png)' }} />
            <div className={styles.collCardOverlay} />
            <div className={styles.collCardContent}>
              <div className={styles.collName}>{t('vinyls')}</div>
              <div className={styles.collDesc}>{t('welcomeVinylDesc')}</div>
            </div>
          </div>
          <div className={`${styles.collCard} ${styles.collRum}`}>
            <div className={styles.collCardPhoto} style={{ backgroundImage: 'url(/hero-1.png)' }} />
            <div className={styles.collCardOverlay} />
            <div className={styles.collCardContent}>
              <div className={styles.collName}>{t('rums')}</div>
              <div className={styles.collDesc}>{t('welcomeRumDesc')}</div>
            </div>
          </div>
          <div className={`${styles.collCard} ${styles.collWhisky}`}>
            <div className={styles.collCardPhoto} style={{ backgroundImage: 'url(/hero-2.png)' }} />
            <div className={styles.collCardOverlay} />
            <div className={styles.collCardContent}>
              <div className={styles.collName}>{t('whiskies')}</div>
              <div className={styles.collDesc}>{t('welcomeWhiskyDesc')}</div>
            </div>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.featuresTitle}>{t('welcomeCanDo')}</div>
          <ul className={styles.featureList}>
            <li><SearchIcon /> {t('welcomeAction1')}</li>
            <li><StatsIcon /> {t('welcomeAction2')}</li>
            <li><SpotifyIcon /> {t('welcomeAction3')}</li>
            <li><ShareIcon /> {t('welcomeAction4')}</li>
            <li className={styles.featureSessions}><SessionIcon /> {t('welcomeAction5')}</li>
          </ul>
          <p className={styles.introCta}>{t('welcomeBodyCta')}</p>
        </div>

        <div className={styles.footer}>
          <label className={styles.checkLabel}>
            <input type="checkbox" className={styles.checkbox} checked={dontShow} onChange={e => setDontShow(e.target.checked)} />
            <span>{t('welcomeDontShow')}</span>
          </label>
          <button className={styles.ctaBtn} onClick={handleClose}>
            {t('welcomeExplore')}
          </button>
        </div>

      </div>
    </div>
  )
}
