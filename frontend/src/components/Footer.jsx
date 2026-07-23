export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-disclaimer">
        <div className="disclaimer-block">
          <h4>Capital investments</h4>
          <p>
            Investing involves risks. Derivatives and Cryptocurrencies entail high risks.
            The value of your investment may fall or rise. Losses of the capital invested may occur.
            Past performance offers no reliable indication of future performance.
          </p>
        </div>
        <div className="disclaimer-block">
          <h4>Cash</h4>
          <p>
            *2.50% interest p.a. on unlimited Overnight savings. Variable interest and variable
            distribution depend, among other things, on market rates, capacities, and conditions.
          </p>
        </div>
        <div className="disclaimer-block">
          <h4>Taxes</h4>
          <p>
            Scalable Capital does not provide tax advice. Tax treatment is individual and can change.
          </p>
        </div>
      </div>

      <div className="footer-links">
        <div className="footer-col">
          <h4>Scalable Capital</h4>
          <a href="#">Status</a>
          <a href="#">Careers</a>
          <a href="#">Newsroom</a>
          <a href="#">Security</a>
        </div>
        <div className="footer-col">
          <h4>Information</h4>
          <a href="#">Documents</a>
          <a href="#">Data Protection</a>
          <a href="#">Sustainability</a>
          <a href="#">Privacy settings</a>
        </div>
      </div>

      <div className="footer-bottom">
        <span>About us</span>
        <span className="sep">|</span>
        <span>Contact</span>
        <span className="sep">|</span>
        <span>Legal information</span>
        <span className="copyright">
          Copyright © Scalable Capital Bank GmbH | All rights reserved.
        </span>
      </div>
    </footer>
  )
}
