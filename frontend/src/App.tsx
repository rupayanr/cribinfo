import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { HomePage } from './pages/HomePage'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { WelcomeModal } from './components/WelcomeModal/WelcomeModal'

function App() {
  return (
    <>
      <WelcomeModal />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/architecture" element={<ArchitecturePage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
