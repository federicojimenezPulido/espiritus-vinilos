import { createContext, useContext, useState } from 'react'
import { t as translate } from './i18n'

const LangContext = createContext({ lang: 'es', t: (k) => k })

export function LangProvider({ children }) {
  const [lang, setLang] = useState('es')
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
