"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

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
      className={`sticky top-0 z-50 border-b transition-[border-color,background] duration-200 ${scrolled || menuOpen ? "border-line" : "border-transparent"}`}
      style={{
        background: "color-mix(in oklab, var(--bg) 86%, transparent)",
        backdropFilter: "blur(14px) saturate(140%)",
        WebkitBackdropFilter: "blur(14px) saturate(140%)",
      }}
    >
      <div className="wrap flex items-center justify-between h-16 max-[900px]:h-[58px]">
        <a href="/" className="flex items-center gap-[10px] max-[600px]:gap-2">
          <Image
            src="/assets/usemoos_icon.png"
            width={32}
            height={32}
            alt=""
            aria-hidden="true"
          />
          <span className="font-bold text-[20px] tracking-[-0.02em] max-[900px]:text-[17px] max-[600px]:text-[16px]">
            usemoos
          </span>
        </a>

        <div className="flex gap-[30px] max-[900px]:hidden">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[14px] font-medium text-ink-2 transition-colors duration-150 hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex gap-[10px] items-center max-[900px]:hidden">
          <a className="btn btn-primary" href="#waitlist">
            Request access →
          </a>
        </div>

        <button
          className="hidden max-[900px]:inline-flex w-10 h-10 border border-line rounded-lg bg-surface items-center justify-center flex-col gap-[5px] shadow-[var(--shadow-sm)] max-[600px]:w-[38px] max-[600px]:h-[38px]"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-controls="mobile-menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span
            className={`block w-[18px] h-[1.5px] rounded-full bg-ink transition-transform duration-[180ms] ${menuOpen ? "translate-y-[6.5px] rotate-45" : ""}`}
          />
          <span
            className={`block w-[18px] h-[1.5px] rounded-full bg-ink transition-opacity duration-[180ms] ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            className={`block w-[18px] h-[1.5px] rounded-full bg-ink transition-transform duration-[180ms] ${menuOpen ? "-translate-y-[6.5px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        className={`absolute top-full left-0 right-0 border-b border-line shadow-[var(--shadow-lg)] transition-[opacity,transform] duration-[180ms] ${menuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-2 pointer-events-none"}`}
        style={{ background: "color-mix(in oklab, var(--bg) 96%, white)" }}
      >
        <div className="wrap grid gap-1 pt-3 pb-4">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center min-h-[44px] px-3 rounded-lg text-ink-2 text-[15px] font-medium hover:bg-surface hover:text-ink"
            >
              {item.label}
            </a>
          ))}
          {/* biome-ignore lint/a11y/useValidAnchor: Close mobile menu while navigating to section anchor */}
          <a
            className="btn btn-primary w-full justify-center mt-2 h-11"
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
