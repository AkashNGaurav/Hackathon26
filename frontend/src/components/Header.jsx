import ThemeToggle from './ThemeToggle'

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a href="#" className="logo">
          <span className="logo-mark">S</span>
          <span className="logo-text">Scalable Capital</span>
        </a>
        <nav className="nav-links">
          <a href="#invest">Invest</a>
          <a href="#insights">Insights</a>
          <a href="#expenses">Expenses</a>
        </nav>
        <div className="header-actions">
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <button type="button" className="btn btn-ghost">Log in</button>
          <button type="button" className="btn btn-primary">Open account</button>
        </div>
      </div>
    </header>
  )
}
