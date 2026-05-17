import Image from "next/image";
import styles from "./Marketing.module.css";
import { cx } from "./styleUtils";

export default function Footer() {
  return (
    <footer className={cx(styles, "footer")}>
      <div className={cx(styles, "wrap foot-wrap")}>
        <div className={cx(styles, "foot-grid")}>
          <div className={cx(styles, "foot-brand")}>
            <div className={cx(styles, "brand")}>
              <Image
                src="/assets/usemoos-icon.svg"
                width={36}
                height={36}
                alt=""
                aria-hidden="true"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <span className={cx(styles, "word")}>usemoos</span>
            </div>
            <p className={cx(styles, "foot-tag")}>
              The centralized intelligence layer for organizational knowledge.
              Built for teams that have outgrown the wiki.
            </p>
          </div>
          <div className={cx(styles, "foot-col")}>
            <h5>Product</h5>
            <ul>
              <li>
                <a href="#product">Overview</a>
              </li>
              <li>
                <a href="#integrations">Integrations</a>
              </li>
              <li>
                <a href="#how">How it works</a>
              </li>
              <li>
                <a href="/changelog">Changelog</a>
              </li>
              <li>
                <a href="/roadmap">Roadmap</a>
              </li>
            </ul>
          </div>
          <div className={cx(styles, "foot-col")}>
            <h5>Company</h5>
            <ul>
              <li>
                <a href="/about">About</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="/careers">Careers</a>
              </li>
              <li>
                <a href="mailto:hello@usemoos.com">Contact</a>
              </li>
            </ul>
          </div>
          <div className={cx(styles, "foot-col foot-col-trust")}>
            <h5>Trust</h5>
            <ul>
              <li>
                <a href="#security">Security</a>
              </li>
              <li>
                <a href="/privacy">Privacy</a>
              </li>
              <li>
                <a href="/terms">Terms</a>
              </li>
              <li>
                <a href="/dpa">DPA</a>
              </li>
              <li>
                <a href="/status">Status</a>
              </li>
            </ul>
          </div>
        </div>
        <div className={cx(styles, "bigmark")}>usemoos</div>
        <div className={cx(styles, "foot-bottom")}>
          <span>© 2026 usemoos, Inc.</span>
          <div className={cx(styles, "links")}>
            <a href="https://x.com/usemoos">Twitter / X</a>
            <a href="https://www.linkedin.com/company/usemoos">LinkedIn</a>
            <a href="mailto:hello@usemoos.com">hello@usemoos.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
