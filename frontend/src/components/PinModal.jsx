import { useState, useEffect, useRef } from 'react'
import styles from './PinModal.module.css'

// Pide el PIN al usuario antes de ejecutar una acción protegida
// onSuccess → ejecuta la acción | onCancel → cancela
export default function PinModal({ action, onSuccess, onCancel }) {
  const [pin, setPin]     = useState('')
  const [error, setError] = useState('')
  const inputRef          = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handler = e => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  function handleConfirm() {
    const saved = localStorage.getItem('admin_pin')
    if (!saved) { onSuccess(); return }      // sin PIN configurado → pasar siempre
    if (pin === saved) { onSuccess() }
    else { setError('PIN incorrecto'); setPin('') }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className={styles.box}>
        <div className={styles.icon}>🔐</div>
        <h3>Acción protegida</h3>
        <p className={styles.action}>{action}</p>
        <input
          ref={inputRef}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          type="password"
          inputMode="numeric"
          placeholder="Ingresá el PIN"
          value={pin}
          onChange={e => { setPin(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && handleConfirm()}
          maxLength={10}
        />
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.actions}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleConfirm}>
            Confirmar
          </button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onCancel}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
