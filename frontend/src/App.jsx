import { useState, useEffect, useRef } from 'react'
import { LangProvider, useLang } from './LangContext'
import Header        from './components/Header'
import Dashboard     from './components/Dashboard'
import HeroSection   from './components/HeroSection'
import SessionesView from './components/SessionesView'
import WelcomeModal, { shouldShowWelcome } from './components/WelcomeModal'
import PinModal      from './components/PinModal'
import SettingsPanel from './components/SettingsPanel'
import { getPinStatus } from './services/api'

function AppInner() {
  const { lang, setLang, t } = useLang()
  const [coll, setColl]               = useState('vinyl')
  const dashboardRef = useRef(null)
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

      {coll === 'sessions' ? (
        <SessionesView />
      ) : (
        <>
          <HeroSection coll={coll} onScrollDown={() => dashboardRef.current?.scrollIntoView({ behavior: 'smooth' })} />

          {/* Franja de transición — surco de vinilo */}
          <div className="grooveStrip">
            <img src="/hero-3.png" alt="" className="grooveStripImg" />
            <div className="grooveStripOverlay" />
            <img src="/logo-enlt.jpeg" alt="En Las Nubes Trepao" className="grooveLogo" />
          </div>

          <div ref={dashboardRef}>
            <Dashboard coll={coll} pinIsSet={pinIsSet} />
          </div>
        </>
      )}
    </>
  )
}

export default function App() {
  return <LangProvider><AppInner /></LangProvider>
}
