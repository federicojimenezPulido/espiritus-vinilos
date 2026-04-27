import { useState, useEffect } from 'react'
import { useCrud } from '../hooks/useCrud'
import { fetchAndSaveCover, fetchAndSaveDiscogsCover, scrapeUrl, fetchPurchaseInfo } from '../services/api'
import { useLang } from '../LangContext'
import styles from './AdminForm.module.css'

// ── localStorage helpers ─────────────────────────────────────────────────────
function storageKey(coll, field) {
  return `enlt_opts_${coll}_${field}`
}

function getExtras(coll, field) {
  try { return JSON.parse(localStorage.getItem(storageKey(coll, field)) || '[]') } catch { return [] }
}

function saveExtra(coll, field, value) {
  const extras = getExtras(coll, field)
  if (!extras.includes(value)) {
    extras.push(value)
    localStorage.setItem(storageKey(coll, field), JSON.stringify(extras))
  }
}

// ── DynamicSelect — dropdown con "+" para agregar opciones ──────────────────
function DynamicSelect({ value, onChange, baseOptions, coll, field }) {
  const [adding,  setAdding]  = useState(false)
  const [newVal,  setNewVal]  = useState('')
  const [options, setOptions] = useState(() => {
    const extras = getExtras(coll, field)
    return [...new Set([...baseOptions, ...extras])].sort()
  })

  function handleAdd() {
    const v = newVal.trim()
    if (!v) return
    saveExtra(coll, field, v)
    const updated = [...new Set([...baseOptions, ...getExtras(coll, field)])].sort()
    setOptions(updated)
    onChange(v)
    setNewVal('')
    setAdding(false)
  }

  return (
    <div className={styles.origenRow}>
      <select
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className={styles.origenSelect}
      >
        <option value="">—</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>

      {adding
        ? <div className={styles.origenAdd}>
            <input
              autoFocus
              type="text"
              placeholder="Nueva opción..."
              value={newVal}
              onChange={e => setNewVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') { setAdding(false); setNewVal('') }
              }}
              className={styles.origenInput}
            />
            <button className={styles.origenConfirm} onClick={handleAdd} title="Confirmar">✓</button>
            <button className={styles.origenCancel} onClick={() => { setAdding(false); setNewVal('') }} title="Cancelar">✕</button>
          </div>
        : <button className={styles.origenPlusBtn} onClick={() => setAdding(true)} title="Agregar nueva opción">+</button>
      }
    </div>
  )
}

// item = null → nuevo registro | item = {...} → editar
// index = posición en el array del backend (necesario para PUT/DELETE)
export default function AdminForm({ coll, item, index, data, onClose, onRequestPin, pinIsSet }) {
  const { add, update, remove } = useCrud(coll)
  const { t } = useLang()
  const isEdit = item !== null && index !== undefined

  const [form, setForm] = useState(buildInitial(item, coll))
  const [fetchingCover, setFetchingCover]       = useState(false)
  const [coverMsg, setCoverMsg]                 = useState('')
  const [manualUrl, setManualUrl]               = useState('')
  const [saveError, setSaveError]               = useState('')
  const [fetchingPurchase, setFetchingPurchase] = useState(false)
  const [purchaseMsg, setPurchaseMsg]           = useState('')

  // Al abrir un vinilo existente → auto-fetch Discogs si no tiene portada
  useEffect(() => {
    setForm(buildInitial(item, coll))
    setCoverMsg('')
    setManualUrl('')

    if (coll === 'vinyl' && item && index !== undefined && !item.cover_url) {
      autoFetchDiscogs(item, index)
    }
  }, [item, coll])

  async function autoFetchDiscogs(vinylItem, vinylIndex) {
    const q = `${vinylItem.artista || ''} ${vinylItem.album || ''}`.trim()
    if (!q) return
    setFetchingCover(true)
    setCoverMsg(t('fetchingCover'))
    try {
      const result = await fetchAndSaveDiscogsCover(vinylIndex, q)
      if (result.cover) {
        setForm(prev => ({ ...prev, cover_url: result.cover }))
        setCoverMsg(t('coverFound'))
      } else {
        setCoverMsg(t('coverNotFound'))
      }
    } catch {
      setCoverMsg(t('coverError'))
    } finally {
      setFetchingCover(false)
    }
  }

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaveError('')
    try {
      const parsed = parseForm(form, coll)
      if (isEdit) {
        if (index < 0) {
          setSaveError(t('indexError'))
          return
        }
        await update.mutateAsync({ index, data: parsed })
      } else {
        await add.mutateAsync(parsed)
      }
      onClose()
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Error desconocido'
      setSaveError(`${t('saveFailed')}: ${msg}`)
    }
  }

  function handleDelete() {
    if (!pinIsSet) {
      alert(t('requirePinMsg'))
      return
    }
    if (!confirm(t('deleteConfirm'))) return
    const doDelete = async () => { await remove.mutateAsync(index); onClose() }
    onRequestPin?.('Eliminar registro', doDelete)
  }

  async function handleFetchPurchase() {
    const url = form.buy_url?.trim()
    if (!url) return
    setFetchingPurchase(true)
    setPurchaseMsg(t('searching'))
    try {
      const result = await fetchPurchaseInfo(url)
      if (result.price) {
        setField('buy_price', result.price)
        if (result.currency) setField('buy_currency', result.currency)
        if (result.availability) setField('buy_availability', result.availability)
        setPurchaseMsg(t('imageFound'))
      } else {
        setPurchaseMsg(t('imageNotFound'))
      }
    } catch {
      setPurchaseMsg(t('imageError'))
    } finally {
      setFetchingPurchase(false)
    }
  }

  async function handleFetchCover() {
    setFetchingCover(true)
    setCoverMsg('')
    try {
      let result
      if (coll === 'vinyl') {
        const q = `${form.artista || ''} ${form.album || ''}`.trim()
        result = await fetchAndSaveDiscogsCover(index, q)
      } else {
        result = await fetchAndSaveCover(coll, index, form.url)
      }
      if (result.cover) {
        setField('cover_url', result.cover)
        setCoverMsg(t('imageFound'))
      } else {
        setCoverMsg(t('imageNotFound'))
      }
    } catch {
      setCoverMsg(t('imageError'))
    } finally {
      setFetchingCover(false)
    }
  }

  async function handleApplyManualUrl() {
    const url = manualUrl.trim()
    if (!url) return

    const isDiscogsRelease = url.includes('discogs.com') &&
      (url.includes('/release/') || url.includes('/master/'))

    if (isDiscogsRelease) {
      setCoverMsg(t('extractingDiscogs'))
      try {
        const result = await scrapeUrl(url)
        if (result.cover) {
          setField('cover_url', result.cover)
          setCoverMsg(t('extractedDiscogs'))
          setManualUrl('')
        } else {
          setCoverMsg(t('extractFailed'))
        }
      } catch {
        setCoverMsg(t('extractError'))
      }
    } else {
      setField('cover_url', url)
      setCoverMsg(t('urlApplied'))
      setManualUrl('')
    }
  }

  const isSaving = add.isPending || update.isPending
  const fields   = getFields(coll, data, t)
  const canFetchCover = isEdit && (
    (coll === 'vinyl' && (form.artista || form.album)) ||
    ((coll === 'rum' || coll === 'whisky') && form.url)
  )

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>
        <div className={`${styles.hdr} ${styles[coll]}`}>
          <h2>{isEdit ? t('editRecord') : t('addRecord')}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGrid}>
            {fields.map(({ key, label, type, options, suggestions }) => (
              <div className={styles.fgroup} key={key}>
                <label>{label}</label>
                {options
                  ? <DynamicSelect
                      value={form[key]}
                      onChange={v => setField(key, v)}
                      baseOptions={options}
                      coll={coll}
                      field={key}
                    />
                  : suggestions
                    ? <>
                        <input
                          list={`dl-${key}`}
                          type="text"
                          value={form[key] ?? ''}
                          onChange={e => setField(key, e.target.value)}
                          placeholder="Escribir o elegir..."
                        />
                        <datalist id={`dl-${key}`}>
                          {suggestions.map(s => <option key={s} value={s} />)}
                        </datalist>
                      </>
                    : <input
                        type={type || 'text'}
                        value={form[key] ?? ''}
                        onChange={e => setField(key, e.target.value)}
                      />
                }
              </div>
            ))}
          </div>

          {/* Sección de compra — solo rones y whiskies */}
          {(coll === 'rum' || coll === 'whisky') && (
            <div className={styles.purchaseSection}>
              <div className={styles.purchaseUrlRow}>
                <div className={styles.fgroup} style={{ flex: 1 }}>
                  <label>{t('whereToBuy')} (URL)</label>
                  <input
                    type="text"
                    value={form.buy_url ?? ''}
                    onChange={e => { setField('buy_url', e.target.value); setPurchaseMsg('') }}
                    placeholder="https://..."
                  />
                </div>
                <button
                  className={`${styles.btn} ${styles.btnSecondary} ${styles.purchaseFetchBtn}`}
                  onClick={handleFetchPurchase}
                  disabled={fetchingPurchase || !form.buy_url?.trim()}
                >
                  {fetchingPurchase ? '...' : '🔍 Buscar info'}
                </button>
              </div>

              {purchaseMsg && <div className={styles.coverMsg}>{purchaseMsg}</div>}

              <div className={styles.purchaseFields}>
                <div className={styles.fgroup}>
                  <label>Precio</label>
                  <input type="text" value={form.buy_price ?? ''} onChange={e => setField('buy_price', e.target.value)} placeholder="—" />
                </div>
                <div className={styles.fgroup}>
                  <label>Moneda</label>
                  <input type="text" value={form.buy_currency ?? ''} onChange={e => setField('buy_currency', e.target.value)} placeholder="COP, USD..." />
                </div>
                <div className={styles.fgroup}>
                  <label>Disponibilidad</label>
                  <input type="text" value={form.buy_availability ?? ''} onChange={e => setField('buy_availability', e.target.value)} placeholder="En stock..." />
                </div>
              </div>
            </div>
          )}

          {/* Sección de portada / imagen ── siempre visible */}
          <div className={styles.coverSection}>
            {form.cover_url && (
              <div className={styles.coverPreview}>
                <img src={form.cover_url} alt="cover" />
                <button
                  className={styles.coverRemove}
                  onClick={() => { setField('cover_url', ''); setCoverMsg('') }}
                >✕</button>
              </div>
            )}

            {coverMsg && (
              <div className={styles.coverMsg}>
                {fetchingCover ? <span className={styles.spinner}>⏳</span> : null} {coverMsg}
              </div>
            )}

            {/* URL manual — siempre disponible, no solo como fallback */}
            <div className={styles.manualUrl}>
              <label>{t('coverUrl')}</label>
              <div className={styles.manualUrlRow}>
                <input
                  type="text"
                  placeholder="https://... (imagen directa o URL de Discogs release)"
                  value={manualUrl || form.cover_url || ''}
                  onChange={e => {
                    setManualUrl(e.target.value)
                    setCoverMsg('')
                  }}
                  onKeyDown={e => e.key === 'Enter' && handleApplyManualUrl()}
                />
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={handleApplyManualUrl}
                  disabled={!manualUrl.trim()}
                >
                  {t('apply')}
                </button>
              </div>
            </div>
          </div>

          {saveError && <div className={styles.saveError}>{saveError}</div>}

          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary} ${styles[coll]}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? t('saving') : t('save')}
            </button>
            {canFetchCover && (
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleFetchCover}
                disabled={fetchingCover}
              >
                {fetchingCover ? t('searchingCover') : coll === 'vinyl' ? t('refetchCover') : t('getCover')}
              </button>
            )}
            {isEdit && (
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleDelete}
                disabled={remove.isPending}
              >
                {t('delete')}
              </button>
            )}
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
              {t('cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Campos por colección ──────────────────────────────────────────────────────
function getFields(coll, data, t) {
  const uniq = (key) => [...new Set((data || []).map(r => r[key]).filter(Boolean))].sort()

  if (coll === 'vinyl') return [
    { key: 'artista',    label: t('artist') },
    { key: 'album',      label: t('album') },
    { key: 'agrupador',  label: t('category'),       options: uniq('agrupador') },
    { key: 'genero',     label: t('genre'),           options: uniq('genero') },
    { key: 'sello',      label: t('label'),           options: uniq('sello') },
    { key: 'pais_sello', label: t('labelCountry'),    options: uniq('pais_sello') },
    { key: 'anio',       label: t('year'),            type: 'number' },
    { key: 'pais',       label: t('pressedCountry'),  options: uniq('pais') },
    { key: 'cat_num',    label: t('catNum') },
    { key: 'origen',     label: t('origin'),          options: uniq('origen') },
    { key: 'fuera',      label: t('lent'),            options: ['No', 'Sí'] },
    { key: 'discogs',    label: t('inDiscogs'),       options: ['true', 'false'] },
    { key: 'url',             label: t('discogsUrl') },
    { key: 'spotify_id',       label: '🎵 Spotify Album ID' },
    { key: 'tiktok_url',      label: t('tiktokField') },
    { key: 'ig_url',          label: t('igField') },
  ]
  if (coll === 'rum') return [
    { key: 'brand',      label: t('brand') },
    { key: 'name',       label: t('name') },
    { key: 'type',       label: t('type'),            options: uniq('type') },
    { key: 'country',    label: t('country'),         options: uniq('country') },
    { key: 'abv',        label: t('abv'),             type: 'number' },
    { key: 'blend',      label: t('blend'),           options: ['Si', 'No'] },
    { key: 'age_low',    label: t('ageMin'),          type: 'number' },
    { key: 'age_max',    label: t('ageMax'),          type: 'number' },
    { key: 'region',     label: t('region'),          suggestions: uniq('region') },
    { key: 'scale',      label: t('scale'),           type: 'number' },
    { key: 'url',        label: t('url') },
    { key: 'terminado',  label: t('finished'),        options: ['No', 'Sí'] },
  ]
  return [
    { key: 'brand',      label: t('brand') },
    { key: 'version',    label: t('expression') },
    { key: 'type',       label: t('type'),            options: uniq('type') },
    { key: 'origin',     label: t('origin'),          options: uniq('origin') },
    { key: 'country',    label: t('country'),         options: uniq('country') },
    { key: 'abv',        label: t('abv'),             type: 'number' },
    { key: 'years',      label: t('years'),           type: 'number' },
    { key: 'region',     label: t('region'),          suggestions: uniq('region') },
    { key: 'distillery', label: t('distillery') },
    { key: 'url',        label: t('url') },
    { key: 'terminado',  label: t('finished'),        options: ['No', 'Sí'] },
  ]
}

function parseForm(form, coll) {
  const f = { ...form }
  if (coll === 'vinyl') {
    f.anio   = f.anio   ? parseInt(f.anio)   : null
    f.fuera  = f.fuera  === 'Sí' || f.fuera === true
    f.discogs= f.discogs === 'true'
  }
  if (coll === 'rum') {
    f.abv       = f.abv     ? parseFloat(f.abv)   : null
    f.age_low   = f.age_low ? parseInt(f.age_low) : null
    f.age_max   = f.age_max ? parseInt(f.age_max) : null
    f.scale     = f.scale   ? parseFloat(f.scale) : null
    f.terminado = f.terminado === 'Sí' || f.terminado === true
  }
  if (coll === 'whisky') {
    f.abv       = f.abv   ? parseFloat(f.abv) : null
    f.years     = f.years ? parseInt(f.years) : null
    f.terminado = f.terminado === 'Sí' || f.terminado === true
  }
  return f
}

function buildInitial(item, coll) {
  if (!item) return {}
  const f = { ...item }
  if (coll === 'vinyl') {
    f.fuera   = f.fuera ? 'Sí' : 'No'
    f.discogs = String(f.discogs ?? false)
  }
  if (coll === 'rum' || coll === 'whisky') {
    f.terminado = f.terminado ? 'Sí' : 'No'
  }
  return f
}
