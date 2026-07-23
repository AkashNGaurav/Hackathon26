export default function Dashboard({
  recommendation,
  sentiment,
  expenses,
  newExpense,
  setNewExpense,
  onSubmitExpense,
}) {
  return (
    <section className="dashboard-section" id="dashboard">
      <div className="section-header">
        <h2>Your financial dashboard</h2>
        <p className="section-subtitle">Live insights powered by AI</p>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card" id="invest">
          <div className="card-header">
            <span className="card-tag">Portfolio</span>
            <h3>Investment Recommendation</h3>
          </div>
          {recommendation ? (
            <div className="card-body">
              <div className="stat-row">
                <div className="stat-pill">
                  <span className="label">Risk profile</span>
                  <span className="value">{recommendation.risk_profile}</span>
                </div>
                <div className="stat-pill">
                  <span className="label">Horizon</span>
                  <span className="value">{recommendation.investment_horizon} years</span>
                </div>
              </div>
              <div className="allocation-grid">
                {Object.entries(recommendation.recommended_allocation || {}).map(([asset, pct]) => (
                  <div key={asset} className="allocation-item">
                    <span className="allocation-name">{asset}</span>
                    <div className="allocation-bar">
                      <div className="allocation-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="allocation-pct">{pct}%</span>
                  </div>
                ))}
              </div>
              <p className="rationale">{recommendation.rationale}</p>
            </div>
          ) : (
            <div className="card-body loading">Loading recommendation…</div>
          )}
        </article>

        <article className="dashboard-card" id="insights">
          <div className="card-header">
            <span className="card-tag">Market</span>
            <h3>Market Sentiment</h3>
          </div>
          {sentiment ? (
            <div className="card-body">
              <div className="sentiment-summary">
                <div className="sentiment-badge" data-sentiment={sentiment.overall_sentiment}>
                  {sentiment.overall_sentiment}
                </div>
                <span className="confidence">
                  Confidence: <strong>{Math.round(sentiment.confidence * 100)}%</strong>
                </span>
              </div>
              <ul className="news-list">
                {sentiment.news_insights.map((item, index) => (
                  <li key={index} className="news-item">
                    <span className={`news-sentiment ${item.sentiment.toLowerCase()}`}>
                      {item.sentiment}
                    </span>
                    <div>
                      <p className="news-title">{item.title}</p>
                      <span className="news-source">{item.source}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="card-body loading">Loading market sentiment…</div>
          )}
        </article>

        <article className="dashboard-card dashboard-card-wide" id="expenses">
          <div className="card-header">
            <span className="card-tag">Budget</span>
            <h3>Expense Tracker</h3>
          </div>
          <div className="card-body">
            <form onSubmit={onSubmitExpense} className="expense-form">
              <div className="form-row">
                <label>
                  Category
                  <input
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                    placeholder="e.g. Groceries"
                    required
                  />
                </label>
                <label>
                  Amount (€)
                  <input
                    value={newExpense.amount}
                    type="number"
                    step="0.01"
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </label>
                <label>
                  Description
                  <input
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="Optional note"
                  />
                </label>
                <button type="submit" className="btn btn-primary">Add expense</button>
              </div>
            </form>
            <div className="expense-list">
              {expenses.length === 0 ? (
                <p className="empty-state">No expenses yet. Add your first one above.</p>
              ) : (
                expenses.map((expense) => (
                  <div className="expense-item" key={expense.id}>
                    <div className="expense-info">
                      <strong>{expense.category}</strong>
                      {expense.description && <span>{expense.description}</span>}
                    </div>
                    <span className="expense-amount">
                      €{Number(expense.amount).toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
