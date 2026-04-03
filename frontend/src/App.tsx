import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { HomePage } from './pages/HomePage'
import { DocsPage } from './pages/DocsPage'
import { WelcomeModal } from './components/WelcomeModal/WelcomeModal'

function App() {
  return (
    <>
      <WelcomeModal />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/docs" element={<DocsPage />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
