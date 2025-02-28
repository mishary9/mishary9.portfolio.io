import { useState } from 'react'
import './App.css'
import PortfolioBackground from './componants/PortfolioBackground'
import PortfolioBackgroundAlt from './Componants/PortfolioBackgroundAlt'
import TechBackground from './Componants/TechBackground.JSX'
import CosmicBackground from './Componants/CosmicBackground'
import DarkSpaceBackground from './Componants/CosmicBackground'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <DarkSpaceBackground />
    </>
  )
}

export default App
