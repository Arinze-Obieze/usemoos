'use client'

import { useEffect, useState } from 'react'

const navItems = [
  { href: '#benefits', label: 'Benefits' },
  { href: '#product', label: 'Product' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#how', label: 'How it works' },
  { href: '#faq', label: 'FAQ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 8) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <nav className={`nav${scrolled || menuOpen ? ' scrolled' : ''}`} data-menu-open={menuOpen ? 'true' : 'false'}>
      <div className="wrap nav-inner">
        <a className="brand" href="#">
          <img src="/assets/usemoos_icon.png" width={32} height={32} alt="" aria-hidden="true" />
          <span className="word">usemoos</span>
        </a>
        <div className="nav-links">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </div>
        <div className="nav-cta">
          <a className="btn btn-primary" href="#waitlist">Request access →</a>
        </div>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div className="mobile-menu" id="mobile-menu" aria-hidden={!menuOpen} hidden={!menuOpen}>
        <div className="wrap mobile-menu-inner">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
          ))}
          <a className="btn btn-primary" href="#waitlist" onClick={() => setMenuOpen(false)}>Request access →</a>
        </div>
      </div>
    </nav>
  )
}
