import { useEffect, useState } from 'react'
import { useTheme } from './hooks/useTheme'
import Header from './components/Header'
import Hero from './components/Hero'
import PromoBanner from './components/PromoBanner'
import Features from './components/Features'
import Products from './components/Products'
import Dashboard from './components/Dashboard'
import Footer from './components/Footer'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [recommendation, setRecommendation] = useState(null)
  const [sentiment, setSentiment] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '' })

  useEffect(() => {
    fetch(`${API_BASE}/recommendations?risk_profile=moderate&investment_horizon=5`)
      .then((res) => res.json())
      .then(setRecommendation)
      .catch(() => setRecommendation(null))
    fetch(`${API_BASE}/sentiment`)
      .then((res) => res.json())
      .then(setSentiment)
      .catch(() => setSentiment(null))
    fetch(`${API_BASE}/expenses`)
      .then((res) => res.json())
      .then(setExpenses)
      .catch(() => setExpenses([]))
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const payload = { ...newExpense, amount: Number(newExpense.amount), currency: 'EUR' }
    const response = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const saved = await response.json()
    setExpenses([saved, ...expenses])
    setNewExpense({ category: '', amount: '', description: '' })
  }

  return (
    <div className="app">
      <Header theme={theme} onToggleTheme={toggleTheme} />
      <main>
        <Hero />
        <PromoBanner />
        <Features />
        <Products />
        <Dashboard
          recommendation={recommendation}
          sentiment={sentiment}
          expenses={expenses}
          newExpense={newExpense}
          setNewExpense={setNewExpense}
          onSubmitExpense={handleSubmit}
        />
      </main>
      <Footer />
    </div>
  )
}

export default App
