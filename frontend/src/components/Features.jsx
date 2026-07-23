const features = [
  {
    title: 'Empowering everyone',
    description:
      'Take confident steps toward your financial future with low fees and an easy-to-use app powered by AI.',
    icon: '◆',
  },
  {
    title: 'Shape your finances your way',
    description:
      'Invest at your pace with portfolio recommendations that suit your risk profile and investment horizon.',
    icon: '◇',
  },
  {
    title: 'Seamless experience',
    description:
      'Innovative technology ensures your experience is simple and reliable, so you can focus on what matters — your goals.',
    icon: '○',
  },
]

export default function Features() {
  return (
    <section className="features-section">
      <div className="section-header">
        <h2>Investing and saving — all in one app.</h2>
        <p className="section-subtitle">With Scalable.</p>
      </div>
      <div className="features-grid">
        {features.map((feature) => (
          <article key={feature.title} className="feature-card">
            <span className="feature-icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
