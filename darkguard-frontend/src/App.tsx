import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useStore } from './store/useStore'
import Navbar from './components/Navbar'
import AuthModal from './components/AuthModal'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Complaints from './pages/Complaints'
import Leaderboard from './pages/Leaderboard'
import Community from './pages/Community'
import Audit from './pages/Audit'
import Settings from './pages/Settings'

export default function App() {
  const { checkAuth } = useStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <Navbar />
      <AuthModal />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/complaints" element={<Complaints />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/community" element={<Community />} />
        <Route path="/audit" element={<Audit />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  )
}
