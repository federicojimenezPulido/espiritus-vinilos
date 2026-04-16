import { useState, useEffect } from 'react'
import { useCrud } from '../hooks/useCrud'
import { fetchAndSaveCover, fetchAndSaveDiscogsCover, scrapeUrl } from '../services/api'
import styles from './AdminForm.module.css'

// item = null → nuevo registro | item = {...} → editar
// index = posición en el array del backend (necesario para PUT/DELETE)
export default function AdminForm({ coll, item, index, data, onClose, onRequestPin }) {
  const { add, update, remove } = useCrud(coll)
  const isEdit = item !== null && index !== undefined

  const [form, setForm] = useState(buildInitial(item, coll))
  const [fetchingCover, setFetchingCover] = useState(false)
  const [coverMsg, setCoverMsg]           = useState('')
  const [showManualUrl, setShowManualUrl] = useState(false)
  const [manualUrl, setManualUrl]         = useState('')

  // Al abrir un vinilo existente → auto-fetch Discogs si no tiene portada
  useEffect(() => {
    setForm(buildInitial(item, coll))
    setCoverMsg('')
    setShowManualUrl(false)
    setManualUrl('')

    if (coll === 'vinyl' && item && index !== undefined && !item.cover_url) {
      autoFetchDiscogs(item, index)
    }
  }, [item, coll])

  async function autoFetchDiscogs(vinylItem, vinylIndex) {
    const q = `${vinylItem.artista || ''} ${vinylItem.album || ''}`.trim()
    if (!q) return
    setFetchingCover(true)
    setCoverMsg('Buscando portada en Discogs...')
    try {
      const result = await fetchAndSaveDiscogsCover(vinylIndex, q)
      if (result.cover) {
        setForm(prev => ({ ...prev, cover_url: result.cover }))
        setCoverMsg('✅ Portada encontrada')
        setShowManualUrl(false)
      } else {
        setCoverMsg('⚠ No encontrada en Discogs — podés pegar la URL manualmente')
        setShowManualUrl(true)
      }
    } catch {
      setCoverMsg('⚠ Error buscando portada')
      setShowManualUrl(true)
    } finally {
      setFetchingCover(false)
    }
  }

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    const parsed = parseForm(form, coll)
    if (isEdit) {
      await update.mutateAsync({ index, data: parsed })
    } else {
      await add.mutateAsync(parsed)
    }
    onClose()
  }

  function handleDelete() {
    if (!confirm(`¿Eliminar este registro? Esta acción no se puede deshacer.`)) return
    const doDelete = async () => { await remove.mutateAsync(index); onClose() }
    const pin = localStorage.getItem('admin_pin')
    if (!pin) { doDelete(); return }
    // Delegar la verificación al PinModal — pasamos el callback al padre via onRequestPin
    onRequestPin?.('Eliminar registro', doDelete)
  }

  // Buscar portada manualmente (botón) — vinilos: Discogs | licores: og:image
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
        setCoverMsg('✅ Imagen encontrada')
        setShowManualUrl(false)
      } else {
        setCoverMsg('⚠ No se encontró imagen')
        setShowManualUrl(true)
      }
    } catch {
      setCoverMsg('⚠ Error al buscar imagen — pegá la URL manualmente')
      setShowManualUrl(true)
    } finally {
      setFetchingCover(false)
    }
  }

  // Usar URL manual ingresada por el usuario
  // Si es una URL de release de Discogs → raspa og:image automáticamente
  // Si es una imagen directa → la usa tal cual
  async function handleApplyManualUrl() {
    const url = manualUrl.trim()
    if (!url) return

    const isDiscogsRelease = url.includes('discogs.com') &&
      (url.includes('/release/') || url.includes('/master/'))

    if (isDiscogsRelease) {
      setCoverMsg('🔍 Extrayendo imagen del release de Discogs...')
      try {
        const result = await scrapeUrl(url)
        if (result.cover) {
          setField('cover_url', result.cover)
          setCoverMsg('✅ Imagen extraída de Discogs — guardá para confirmar')
          setShowManualUrl(false)
          setManualUrl('')
        } else {
          setCoverMsg('⚠ No se pudo extraer la imagen de esa página. Pegá la URL directa de la imagen (i.discogs.com/...)')
        }
      } catch {
        setCoverMsg('⚠ Error al acceder a Discogs')
      }
    } else {
      // URL directa de imagen → usar tal cual
      setField('cover_url', url)
      setCoverMsg('✅ URL aplicada — guardá para confirmar')
      setShowManualUrl(false)
      setManualUrl('')
    }
  }

  const isSaving = add.isPending || update.isPending
  const fields   = getFields(coll, data)
  const canFetchCover = isEdit && (
    (coll === 'vinyl' && (form.artista || form.album)) ||
    ((coll === 'rum' || coll === 'whisky') && form.url)
  )

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.box}>
        <div className={`${styles.hdr} ${styles[coll]}`}>
          <h2>{isEdit ? '✏ Editar registro' : '+ Agregar registro'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.formGrid}>
            {fields.map(({ key, label, type, options, suggestions }) => (
              <div className={styles.fgroup} key={key}>
                <label>{label}</label>
                {options
                  ? <select value={form[key] ?? ''} onChange={e => setField(key, e.target.value)}>
                      <option value="">—</option>
                      {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
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

          {/* Sección de portada */}
          <div className={styles.coverSection}>
            {/* Preview */}
            {form.cover_url && (
              <div className={styles.coverPreview}>
                <img src={form.cover_url} alt="cover" />
                <button
                  className={styles.coverRemove}
                  onClick={() => { setField('cover_url', ''); setCoverMsg(''); setShowManualUrl(true) }}
                >✕</button>
              </div>
            )}

            {/* Mensaje de estado */}
            {coverMsg && (
              <div className={styles.coverMsg}>
                {fetchingCover ? <span className={styles.spinner}>⏳</span> : null} {coverMsg}
              </div>
            )}

            {/* Input URL manual — aparece cuando Discogs no encuentra nada */}
            {showManualUrl && (
              <div className={styles.manualUrl}>
                <label>URL de imagen (pegar directo)</label>
                <div className={styles.manualUrlRow}>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={manualUrl}
                    onChange={e => setManualUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleApplyManualUrl()}
                  />
                  <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={handleApplyManualUrl}
                    disabled={!manualUrl.trim()}
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.btn} ${styles.btnPrimary} ${styles[coll]}`}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Guardando...' : '💾 Guardar'}
            </button>
            {canFetchCover && (
              <button
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={handleFetchCover}
                disabled={fetchingCover}
              >
                {fetchingCover ? 'Buscando...' : coll === 'vinyl' ? '🔄 Re-buscar portada' : '🖼 Obtener imagen'}
              </button>
            )}
            {isEdit && (
              <button
                className={`${styles.btn} ${styles.btnDanger}`}
                onClick={handleDelete}
                disabled={remove.isPending}
              >
                🗑 Eliminar
              </button>
            )}
            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onClose}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Campos por colección ──────────────────────────────────────────────────────
function getFields(coll, data) {
  const uniq = (key) => [...new Set((data || []).map(r => r[key]).filter(Boolean))].sort()

  if (coll === 'vinyl') return [
    { key: 'artista',    label: 'Artista' },
    { key: 'album',      label: 'Álbum' },
    { key: 'agrupador',  label: 'Categoría',    options: uniq('agrupador') },
    { key: 'genero',     label: 'Género',        options: uniq('genero') },
    { key: 'sello',      label: 'Sello' },
    { key: 'pais_sello', label: 'País sello' },
    { key: 'anio',       label: 'Año',           type: 'number' },
    { key: 'pais',       label: 'País prensado' },
    { key: 'cat_num',    label: 'Cat. Nº' },
    { key: 'origen',     label: 'Origen',         suggestions: uniq('origen') },
    { key: 'fuera',      label: 'Prestado',       options: ['No', 'Sí'] },
    { key: 'discogs',    label: 'En Discogs',    options: ['true', 'false'] },
    { key: 'url',        label: 'URL Discogs (página del release)' },
  ]
  if (coll === 'rum') return [
    { key: 'brand',      label: 'Marca' },
    { key: 'name',       label: 'Nombre' },
    { key: 'type',       label: 'Tipo',         options: uniq('type') },
    { key: 'country',    label: 'País',          options: uniq('country') },
    { key: 'abv',        label: 'ABV %',         type: 'number' },
    { key: 'blend',      label: 'Blend',         options: ['Si', 'No'] },
    { key: 'age_low',    label: 'Edad mín',      type: 'number' },
    { key: 'age_max',    label: 'Edad máx',      type: 'number' },
    { key: 'region',     label: 'Región',        suggestions: uniq('region') },
    { key: 'scale',      label: 'Escala (1-5)',  type: 'number' },
    { key: 'url',        label: 'URL' },
    { key: 'terminado',  label: 'Ya consumí',    options: ['No', 'Sí'] },
  ]
  return [
    { key: 'brand',      label: 'Marca' },
    { key: 'version',    label: 'Expresión' },
    { key: 'type',       label: 'Tipo',          options: uniq('type') },
    { key: 'origin',     label: 'Origen',        suggestions: uniq('origin') },
    { key: 'country',    label: 'País',          options: uniq('country') },
    { key: 'abv',        label: 'ABV %',         type: 'number' },
    { key: 'years',      label: 'Años (0 = NAS)', type: 'number' },
    { key: 'region',     label: 'Región',        suggestions: uniq('region') },
    { key: 'distillery', label: 'Destilería' },
    { key: 'url',        label: 'URL' },
    { key: 'terminado',  label: 'Ya consumí',    options: ['No', 'Sí'] },
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
