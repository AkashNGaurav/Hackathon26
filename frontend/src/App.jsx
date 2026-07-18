import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

function App() {
  const [recommendation, setRecommendation] = useState(null)
  const [sentiment, setSentiment] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [newExpense, setNewExpense] = useState({ category: '', amount: '', description: '' })

  useEffect(() => {
    fetch(`${API_BASE}/recommendations?risk_profile=moderate&investment_horizon=5`)
      .then(res => res.json())
      .then(setRecommendation)
    fetch(`${API_BASE}/sentiment`).then(res => res.json()).then(setSentiment)
    fetch(`${API_BASE}/expenses`).then(res => res.json()).then(setExpenses)
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
    <div className="page">
      <header>
        <h1>AI Investment & Wealth Manager</h1>
        <p>Smart portfolio suggestions, market sentiment, and spend tracking.</p>
      </header>

      <section className="card">
        <h2>Investment Recommendation</h2>
        {recommendation ? (
          <div>
            <p><strong>Risk:</strong> {recommendation.risk_profile}</p>
            <p><strong>Horizon:</strong> {recommendation.investment_horizon} years</p>
            <pre>{JSON.stringify(recommendation.recommended_allocation, null, 2)}</pre>
            <p>{recommendation.rationale}</p>
          </div>
        ) : (
          <p>Loading recommendation…</p>
        )}
      </section>

      <section className="card">
        <h2>Market Sentiment</h2>
        {sentiment ? (
          <div>
            <p><strong>Overall:</strong> {sentiment.overall_sentiment}</p>
            <p><strong>Confidence:</strong> {sentiment.confidence}</p>
            <ul>
              {sentiment.news_insights.map((item, index) => (
                <li key={index}>
                  <strong>{item.sentiment}</strong>: {item.title} ({item.source})
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p>Loading market sentiment…</p>
        )}
      </section>

      <section className="card">
        <h2>Expense Tracker</h2>
        <form onSubmit={handleSubmit} className="expense-form">
          <label>
            Category
            <input
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              required
            />
          </label>
          <label>
            Amount
            <input
              value={newExpense.amount}
              type="number"
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              required
            />
          </label>
          <label>
            Description
            <input
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
            />
          </label>
          <button type="submit">Add Expense</button>
        </form>
        <div className="expense-list">
          {expenses.map((expense) => (
            <div className="expense-item" key={expense.id}>
              <strong>{expense.category}</strong> - {expense.amount} {expense.currency}
              <div>{expense.description}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

export default App
