"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import styles from "./Marketing.module.css";
import { cx } from "./styleUtils";

const navItems = [
  { href: "#benefits", label: "Benefits" },
  { href: "#product", label: "Product" },
  { href: "#integrations", label: "Integrations" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav
      className={cx(styles, "nav", (scrolled || menuOpen) && "scrolled")}
      data-menu-open={menuOpen ? "true" : "false"}
    >
      <div className={cx(styles, "wrap nav-inner")}>
        <a className={cx(styles, "brand")} href="/">
          <Image
            src="/assets/usemoos_icon.png"
            width={32}
            height={32}
            alt=""
            aria-hidden="true"
          />
          <span className={cx(styles, "word")}>usemoos</span>
        </a>
        <div className={cx(styles, "nav-links")}>
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
        <div className={cx(styles, "nav-cta")}>
          <a className={cx(styles, "btn btn-primary")} href="#waitlist">
            Request access →
          </a>
        </div>
        <button
          className={cx(styles, "menu-toggle")}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
      <div
        className={cx(styles, "mobile-menu")}
        id="mobile-menu"
        aria-hidden={!menuOpen}
        hidden={!menuOpen}
      >
        <div className={cx(styles, "wrap mobile-menu-inner")}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          {/* biome-ignore lint/a11y/useValidAnchor: Close mobile menu while navigating to section anchor */}
          <a
            className={cx(styles, "btn btn-primary")}
            href="#waitlist"
            onClick={() => setMenuOpen(false)}
          >
            Request access →
          </a>
        </div>
      </div>
    </nav>
  );
}
