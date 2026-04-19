import { useState, useEffect, useRef } from 'react'
import { useLang } from '../LangContext'
import styles from './PinModal.module.css'
import { verifyPin } from '../services/api'

// Pide el PIN al usuario antes de ejecutar una acción protegida
// onSuccess → ejecuta la acción | onCancel → cancela
export default function PinModal({ action, onSuccess, onCancel }) {
  const { t } = useLang()
  const [pin,     setPin]     = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const inputRef              = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handler = e => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  async function handleConfirm() {
    setLoading(true)
    setError('')
    try {
      const { valid } = await verifyPin(pin)
      if (valid) { onSuccess() }
      else { setError(t('pinWrong')); setPin('') }
    } catch {
      setError(t('pinConnError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className={styles.box}>
        <div className={styles.icon}>🔐</div>
        <h3>{t('pinProtected')}</h3>
        <p className={styles.action}>{action}</p>
        <input
          ref={inputRef}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          type="password"
          inputMode="numeric"
          placeholder={t('pinEnter')}
          value={pin}
          onChange={e => { setPin(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          maxLength={10}
        />
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleConfirm} disabled={loading}>
            {loading ? '…' : t('confirm')}
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCancel}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}
