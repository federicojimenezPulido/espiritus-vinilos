import { createContext, useContext, useState } from 'react'
import { t as translate } from './i18n'

const LangContext = createContext({ lang: 'es', t: (k) => k })

function getSavedLang() {
  try { return localStorage.getItem('enlt_lang') || 'es' } catch { return 'es' }
}

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(getSavedLang)

  function setLang(l) {
    setLangState(l)
    try { localStorage.setItem('enlt_lang', l) } catch {}
  }

  const t = (key) => translate(key, lang)
  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
