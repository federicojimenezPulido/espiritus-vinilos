import { useState } from 'react'
import Header       from './components/Header'
import Dashboard    from './components/Dashboard'
import WelcomeModal, { shouldShowWelcome } from './components/WelcomeModal'

function App() {
  const [coll, setColl] = useState('vinyl')
  const [showWelcome, setShowWelcome] = useState(shouldShowWelcome)

  return (
    <>
      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      <Header coll={coll} setColl={setColl} />
      <Dashboard coll={coll} />
    </>
  )
}

export default App
