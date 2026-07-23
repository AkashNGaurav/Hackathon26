export default function Products() {
  return (
    <section className="products-section">
      <div className="product-card product-broker">
        <div className="product-content">
          <span className="product-tag">Broker</span>
          <h3>Self-investing</h3>
          <p>
            Trade stocks, ETFs, crypto &amp; more, and set up savings plans from just €1.
            AI recommendations tailored to your risk profile.
          </p>
          <a href="#invest" className="product-link">Learn more →</a>
        </div>
        <div className="product-visual broker-visual">
          <div className="mini-card">
            <span>ETF</span>
            <strong>+8.2%</strong>
          </div>
          <div className="mini-card">
            <span>Stocks</span>
            <strong>+5.1%</strong>
          </div>
          <div className="mini-card">
            <span>Bonds</span>
            <strong>+2.4%</strong>
          </div>
        </div>
      </div>

      <div className="product-card product-wealth">
        <div className="product-content">
          <span className="product-tag">Wealth</span>
          <h3>Automated investing</h3>
          <p>
            Professional, cost-effective portfolio management powered by AI agents
            and real-time market sentiment analysis.
          </p>
          <a href="#insights" className="product-link">Learn more →</a>
        </div>
        <div className="product-visual wealth-visual">
          <div className="sentiment-ring">
            <span className="ring-label">Sentiment</span>
            <span className="ring-value">Bullish</span>
          </div>
        </div>
      </div>
    </section>
  )
}
