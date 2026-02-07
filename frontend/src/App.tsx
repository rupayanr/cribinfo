import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout/Layout'
import { HomePage } from './pages/HomePage'
import { ArchitecturePage } from './pages/ArchitecturePage'
import { DocsPage } from './pages/DocsPage'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/architecture" element={<ArchitecturePage />} />
        <Route path="/docs" element={<DocsPage />} />
      </Route>
    </Routes>
  )
}

export default App
