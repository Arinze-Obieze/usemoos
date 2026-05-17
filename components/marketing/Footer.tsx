export default function Footer() {
  return (
    <footer>
      <div className="wrap foot-wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <div className="brand">
              <img src="/assets/usemoos-icon.svg" width={36} height={36} alt="" aria-hidden="true" style={{ filter: 'brightness(0) invert(1)' }} />
              <span className="word">usemoos</span>
            </div>
            <p className="foot-tag">The centralized intelligence layer for organizational knowledge. Built for teams that have outgrown the wiki.</p>
          </div>
          <div className="foot-col">
            <h5>Product</h5>
            <ul>
              <li><a href="#product">Overview</a></li>
              <li><a href="#integrations">Integrations</a></li>
              <li><a href="#how">How it works</a></li>
              <li><a href="#">Changelog</a></li>
              <li><a href="#">Roadmap</a></li>
            </ul>
          </div>
          <div className="foot-col">
            <h5>Company</h5>
            <ul>
              <li><a href="#">About</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Contact</a></li>
            </ul>
          </div>
          <div className="foot-col foot-col-trust">
            <h5>Trust</h5>
            <ul>
              <li><a href="#security">Security</a></li>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">DPA</a></li>
              <li><a href="#">Status</a></li>
            </ul>
          </div>
        </div>
        <div className="bigmark">usemoos</div>
        <div className="foot-bottom">
          <span>© 2026 usemoos, Inc.</span>
          <div className="links">
            <a href="#">Twitter / X</a>
            <a href="#">LinkedIn</a>
            <a href="mailto:hello@usemoos.com">hello@usemoos.com</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
