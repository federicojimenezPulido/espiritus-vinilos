import axios from 'axios'

const BASE = 'http://localhost:8000'

const api = axios.create({ baseURL: BASE })

// ── VINILOS ──────────────────────────────────────────────────────────────────
export const getVinyls   = (params) => api.get('/api/vinyls/', { params }).then(r => r.data)
export const addVinyl    = (data)   => api.post('/api/vinyls/', data).then(r => r.data)
export const updateVinyl = (i, data)=> api.put(`/api/vinyls/${i}`, data).then(r => r.data)
export const deleteVinyl = (i)      => api.delete(`/api/vinyls/${i}`)

// ── RONES ─────────────────────────────────────────────────────────────────────
export const getRums     = (params) => api.get('/api/rums/', { params }).then(r => r.data)
export const addRum      = (data)   => api.post('/api/rums/', data).then(r => r.data)
export const updateRum   = (i, data)=> api.put(`/api/rums/${i}`, data).then(r => r.data)
export const deleteRum   = (i)      => api.delete(`/api/rums/${i}`)

// ── WHISKIES ──────────────────────────────────────────────────────────────────
export const getWhiskies    = (params) => api.get('/api/whiskies/', { params }).then(r => r.data)
export const addWhisky      = (data)   => api.post('/api/whiskies/', data).then(r => r.data)
export const updateWhisky   = (i, data)=> api.put(`/api/whiskies/${i}`, data).then(r => r.data)
export const deleteWhisky   = (i)      => api.delete(`/api/whiskies/${i}`)

// ── COVERS ────────────────────────────────────────────────────────────────────
export const getCover = (type, q) => {
  const token = localStorage.getItem('discogs_token')
  return api.get('/api/covers/', {
    params: { type, q },
    headers: token ? { 'x-discogs-token': token } : {},
  }).then(r => r.data)
}

// Scrapea og:image de la URL del licor y guarda cover_url en el JSON
export const fetchAndSaveCover = (coll, index, url) =>
  api.post('/api/covers/fetch', { coll, index, url }).then(r => r.data)

// Raspa og:image de cualquier URL (sin guardar) — para input manual
export const scrapeUrl = (url) =>
  api.get('/api/covers/scrape', { params: { url } }).then(r => r.data)

// Fetchea portadas Discogs para TODOS los vinilos sin cover_url de una vez
export const bulkFetchCovers = () => {
  const token = localStorage.getItem('discogs_token')
  return api.post('/api/covers/bulk-discogs', {}, {
    headers: token ? { 'x-discogs-token': token } : {},
    timeout: 120000, // puede tardar varios minutos con 100+ vinilos
  }).then(r => r.data)
}

// Busca portada en Discogs y la persiste en el vinilo
export const fetchAndSaveDiscogsCover = (index, q) => {
  const token = localStorage.getItem('discogs_token')
  return api.post('/api/covers/fetch-discogs', { index, q }, {
    headers: token ? { 'x-discogs-token': token } : {},
  }).then(r => r.data)
}
