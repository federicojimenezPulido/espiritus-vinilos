import { forwardRef } from 'react'
import styles from './HeroSection.module.css'

const HeroSection = forwardRef(function HeroSection({ onScrollDown }, ref) {
  return (
    <section className={styles.hero} ref={ref}>

      {/* Vinilo decorativo — CSS puro, sin imagen */}
      <div className={styles.vinylWrap} aria-hidden="true">
        <div className={styles.vinyl}>
          <div className={styles.vinylLabel} />
          <div className={styles.vinylGroove} />
          <div className={styles.vinylCenter} />
        </div>
      </div>

      {/* Contenido editorial */}
      <div className={styles.content}>

        <p className={styles.eyebrow}>En Las Nubes Trepao</p>

        <h1 className={styles.headline}>
          Para escuchar<br />
          con algo<br />
          en la mano.
        </h1>

        <p className={styles.tagline}>
          Vinilos, rones y whiskies.<br />
          Una colección personal desde Bogotá.
        </p>

        <button
          className={styles.scrollCue}
          onClick={onScrollDown}
          aria-label="Ver la colección"
        >
          <span className={styles.scrollLabel}>La colección</span>
          <span className={styles.scrollArrow}>↓</span>
        </button>
      </div>

      {/* Degradado de transición hacia la colección */}
      <div className={styles.fadeBottom} aria-hidden="true" />
    </section>
  )
})

export default HeroSection
