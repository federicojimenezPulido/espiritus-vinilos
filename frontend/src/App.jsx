import { useState, useEffect } from 'react'
import { LangProvider, useLang } from './LangContext'
import Header        from './components/Header'
import Dashboard     from './components/Dashboard'
import WelcomeModal, { shouldShowWelcome } from './components/WelcomeModal'
import PinModal      from './components/PinModal'
import SettingsPanel from './components/SettingsPanel'
import { getPinStatus } from './services/api'

function AppInner() {
  const { lang, setLang, t } = useLang()
  const [coll, setColl]               = useState('vinyl')
  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome)
  const [showSettingsPin, setShowSettingsPin] = useState(false)
  const [showSettings,    setShowSettings]    = useState(false)
  const [pinIsSet,        setPinIsSet]        = useState(false)

  useEffect(() => {
    getPinStatus().then(({ set }) => setPinIsSet(set)).catch(() => {})
  }, [])

  function refreshPinStatus() {
    getPinStatus().then(({ set }) => setPinIsSet(set)).catch(() => {})
  }

  function handleSettingsClick() {
    if (pinIsSet) { setShowSettingsPin(true) }
    else          { setShowSettings(true)    }
  }

  return (
    <>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}

      {showSettingsPin && (
        <PinModal
          action={t('settingsTitle')}
          onSuccess={() => { setShowSettingsPin(false); setShowSettings(true) }}
          onCancel={() => setShowSettingsPin(false)}
        />
      )}

      {showSettings && (
        <SettingsPanel onClose={() => setShowSettings(false)} onPinChange={refreshPinStatus} />
      )}

      <Header coll={coll} setColl={setColl} onSettings={handleSettingsClick} lang={lang} setLang={setLang} />
      <Dashboard coll={coll} pinIsSet={pinIsSet} />
    </>
  )
}

export default function App() {
  return <LangProvider><AppInner /></LangProvider>
}
