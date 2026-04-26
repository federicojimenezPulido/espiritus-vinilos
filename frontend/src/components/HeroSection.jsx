import { forwardRef } from 'react'
import { useLang } from '../LangContext'
import styles from './HeroSection.module.css'

const HERO_IMGS = {
  vinyl:  { img: '/hero-4.png', imgPos: 'center top'  },
  rum:    { img: '/hero-1.png', imgPos: 'center 30%'  },
  whisky: { img: '/hero-2.png', imgPos: 'center 40%'  },
}

const HeroSection = forwardRef(function HeroSection({ coll = 'vinyl', onScrollDown }, ref) {
  const { t } = useLang()

  const { img, imgPos } = HERO_IMGS[coll] || HERO_IMGS.vinyl

  const content = {
    vinyl:  {
      eyebrow:  t('heroVinylEyebrow'),
      headline: t('heroVinylHeadline').split('\n'),
      tagline:  t('heroVinylTagline'),
      cta:      t('heroVinylCta'),
    },
    rum:    {
      eyebrow:  t('heroRumEyebrow'),
      headline: t('heroRumHeadline').split('\n'),
      tagline:  t('heroRumTagline'),
      cta:      t('heroRumCta'),
    },
    whisky: {
      eyebrow:  t('heroWhiskyEyebrow'),
      headline: t('heroWhiskyHeadline').split('\n'),
      tagline:  t('heroWhiskyTagline'),
      cta:      t('heroWhiskyCta'),
    },
  }[coll] || {
    eyebrow:  t('heroVinylEyebrow'),
    headline: t('heroVinylHeadline').split('\n'),
    tagline:  t('heroVinylTagline'),
    cta:      t('heroVinylCta'),
  }

  return (
    <section className={`${styles.hero} ${styles[coll]}`} ref={ref}>

      {/* Foto de fondo */}
      <div className={styles.photoBg} aria-hidden="true">
        <img
          src={img}
          alt=""
          className={styles.photoImg}
          style={{ objectPosition: imgPos }}
          key={img}
        />
        <div className={styles.photoOverlay} />
      </div>

      {/* Contenido editorial */}
      <div className={styles.content}>

        <p className={styles.eyebrow}>{content.eyebrow}</p>

        <h1 className={styles.headline}>
          {content.headline.map((line, i) => (
            <span key={i}>{line}{i < content.headline.length - 1 && <br />}</span>
          ))}
        </h1>

        <p className={styles.tagline}>
          {content.tagline.split('\n').map((line, i, arr) => (
            <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
          ))}
        </p>

        <button
          className={styles.scrollCue}
          onClick={onScrollDown}
          aria-label={`${t('view')} ${content.cta}`}
        >
          <span className={styles.scrollLabel}>{content.cta}</span>
          <span className={styles.scrollArrow}>↓</span>
        </button>
      </div>

      {/* Degradado de transición hacia la colección */}
      <div className={styles.fadeBottom} aria-hidden="true" />
    </section>
  )
})

export default HeroSection
