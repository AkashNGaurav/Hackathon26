export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-content">
          <p className="eyebrow">AI Investment & Wealth Manager</p>
          <h1>Invest with confidence</h1>
          <h2 className="hero-subtitle">Plan ahead. Live comfortably.</h2>
          <p className="hero-description">
            Smarter than ever. Start investing and redefine your financial future:
            AI-powered portfolio advice, live market sentiment &amp; savings tracking from €1.
            Now for the whole family.
          </p>
          <div className="hero-cta">
            <button type="button" className="btn btn-primary btn-lg">Open account</button>
            <span className="risk-note">Investing involves risks.</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="phone-header">
                <span>Portfolio</span>
                <span className="phone-badge">+12.4%</span>
              </div>
              <div className="phone-chart">
                <svg viewBox="0 0 240 80" preserveAspectRatio="none">
                  <polyline
                    points="0,60 30,55 60,45 90,50 120,30 150,35 180,20 210,25 240,10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </div>
              <div className="phone-stats">
                <div>
                  <span className="stat-label">Total value</span>
                  <span className="stat-value">€24,850</span>
                </div>
                <div>
                  <span className="stat-label">Today</span>
                  <span className="stat-value positive">+€142</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
