"use client";

import { useEffect, useRef } from "react";
import styles from "./Hero.module.css";
import { cx } from "./styleUtils";
import WaitlistForm from "./WaitlistForm";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function Hero() {
  const mockRef = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = mockRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      async (entries, obs) => {
        if (entries[0].isIntersecting && !played.current) {
          played.current = true;
          obs.disconnect();
          await playHeroMockup(el);
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={cx(styles, "hero")}>
      <div className={cx(styles, "hero-bg")} />
      <div className={cx(styles, "hero-glow")} />
      <div className={cx(styles, "wrap hero-inner")}>
        <span className={cx(styles, "eyebrow")}>
          <span className={cx(styles, "pill")}>
            <span className={cx(styles, "dot")} />
            Waitlist open
          </span>
          <span className={cx(styles, "eyebrow-text")}>
            Private beta · onboarding new orgs weekly
          </span>
        </span>
        <h1 className={cx(styles, "h1")}>
          Your company&apos;s <em>collective brain</em>, finally searchable.
        </h1>
        <p className={cx(styles, "subhead")}>
          Stop losing hours searching across disconnected tools. usemoos creates
          a unified intelligence layer over Slack, Notion, Drive and more,
          delivering instant answers with trusted citations.
        </p>
        <WaitlistForm id="hero" style={{ margin: "0 auto 14px" }} />
        <div className={cx(styles, "hero-trust")}>
          <span className={cx(styles, "item")}>
            <CheckIcon />
            Work email only
          </span>
          <span className={cx(styles, "sep")} />
          <span className={cx(styles, "item")}>
            <CheckIcon />
            No credit card
          </span>
          <span className={cx(styles, "sep")} />
          <span className={cx(styles, "item")}>
            <CheckIcon />
            Reply in 2 to 3 weeks
          </span>
        </div>

        <div className={cx(styles, "mockup-stage")} id="product">
          <div className={cx(styles, "mockup")} id="hero-mock" ref={mockRef}>
            <div className={cx(styles, "mockup-bar")}>
              <div className={cx(styles, "dots")}>
                <i />
                <i />
                <i />
              </div>
              <div className={cx(styles, "url")}>app.usemoos.ai / acme</div>
              <div className={cx(styles, "spacer")} />
            </div>
            <div className={cx(styles, "mockup-body")}>
              <aside className={cx(styles, "mk-side")}>
                <div className={cx(styles, "mk-side-block")}>
                  <div className={cx(styles, "mk-side-label")}>Workspace</div>
                  <div className={cx(styles, "mk-side-item active")}>
                    <svg
                      aria-hidden="true"
                      className={cx(styles, "ico")}
                      focusable="false"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
                    </svg>
                    Ask usemoos
                    <span className={cx(styles, "kbd")}>⌘ K</span>
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    <svg
                      aria-hidden="true"
                      className={cx(styles, "ico")}
                      focusable="false"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                    Threads
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    <svg
                      aria-hidden="true"
                      className={cx(styles, "ico")}
                      focusable="false"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                    Library
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    <svg
                      aria-hidden="true"
                      className={cx(styles, "ico")}
                      focusable="false"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15 15 0 010 20 15 15 0 010-20z" />
                    </svg>
                    Sources
                  </div>
                </div>
                <div className={cx(styles, "mk-side-block")}>
                  <div className={cx(styles, "mk-side-label")}>
                    Recent threads
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    Q4 onboarding checklist
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    EU data residency policy
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    Pricing review · @nora
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    Incident post-mortem · 04/22
                  </div>
                </div>
                <div className={cx(styles, "mk-side-block")}>
                  <div className={cx(styles, "mk-side-label")}>
                    Connected · 12
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    <span
                      className={cx(styles, "ico")}
                      style={{ fontWeight: 700, color: "#4A154B" }}
                    >
                      #
                    </span>{" "}
                    Slack
                    <span className={cx(styles, "live-dot")} />
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    <span
                      className={cx(styles, "ico")}
                      style={{ fontWeight: 700 }}
                    >
                      N
                    </span>{" "}
                    Notion
                    <span className={cx(styles, "live-dot")} />
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    <span
                      className={cx(styles, "ico")}
                      style={{ fontWeight: 700, color: "#161B22" }}
                    >
                      G
                    </span>{" "}
                    GitHub
                    <span className={cx(styles, "live-dot")} />
                  </div>
                  <div className={cx(styles, "mk-side-item")}>
                    <span
                      className={cx(styles, "ico")}
                      style={{ fontWeight: 700, color: "#1FA463" }}
                    >
                      D
                    </span>{" "}
                    Drive
                    <span className={cx(styles, "live-dot warn")} />
                  </div>
                </div>
              </aside>

              <div className={cx(styles, "mk-chat")}>
                <div className={cx(styles, "msg user")}>
                  <div className={cx(styles, "ava")}>JL</div>
                  <div className={cx(styles, "body")}>
                    What&apos;s our refund policy for annual enterprise
                    contracts, and who approves exceptions over $10k?
                  </div>
                </div>
                <div className={cx(styles, "msg ai")}>
                  <div className={cx(styles, "ava")}>✦</div>
                  <div className={cx(styles, "body")} id="hero-ai-body">
                    <span className={cx(styles, "typedot")}>
                      <i />
                      <i />
                      <i />
                    </span>
                  </div>
                </div>
                <div className={cx(styles, "mk-input")}>
                  <span className={cx(styles, "star")}>✦</span>
                  <span className={cx(styles, "ph")}>
                    Ask anything across Slack, Notion, Drive, GitHub…
                  </span>
                  <span className={cx(styles, "send")}>↵</span>
                </div>
              </div>

              <aside className={cx(styles, "mk-context")}>
                <h4>Sources for this answer</h4>
                <div className={cx(styles, "ctx")}>
                  <div
                    className={cx(styles, "ctx-ico")}
                    style={{ background: "#0F1108" }}
                  >
                    N
                  </div>
                  <div className={cx(styles, "ctx-info")}>
                    <div className={cx(styles, "ctx-title")}>
                      Customer Agreement v4.2
                    </div>
                    <div className={cx(styles, "ctx-meta")}>
                      Notion · Legal · 2d
                    </div>
                  </div>
                  <div className={cx(styles, "ctx-num")}>1</div>
                </div>
                <div className={cx(styles, "ctx")}>
                  <div
                    className={cx(styles, "ctx-ico")}
                    style={{ background: "#4A154B" }}
                  >
                    #
                  </div>
                  <div className={cx(styles, "ctx-info")}>
                    <div className={cx(styles, "ctx-title")}>
                      #finance-approvals
                    </div>
                    <div className={cx(styles, "ctx-meta")}>
                      Slack · @maya · Mar 12
                    </div>
                  </div>
                  <div className={cx(styles, "ctx-num")}>2</div>
                </div>
                <div className={cx(styles, "ctx")}>
                  <div
                    className={cx(styles, "ctx-ico")}
                    style={{ background: "#1FA463" }}
                  >
                    D
                  </div>
                  <div className={cx(styles, "ctx-info")}>
                    <div className={cx(styles, "ctx-title")}>
                      Refunds Playbook 2026
                    </div>
                    <div className={cx(styles, "ctx-meta")}>
                      Drive · Finance · v3
                    </div>
                  </div>
                  <div className={cx(styles, "ctx-num")}>3</div>
                </div>
                <h4>Access check</h4>
                <div className={cx(styles, "ctx ctx-perm")}>
                  <div className={cx(styles, "ctx-ico")}>✓</div>
                  <div className={cx(styles, "ctx-info")}>
                    <div className={cx(styles, "ctx-title")}>
                      All 3 sources are in your scope
                    </div>
                    <div className={cx(styles, "ctx-meta")}>
                      Permission-aware retrieval
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

async function playHeroMockup(root: HTMLElement) {
  const messages = root.querySelectorAll<HTMLElement>(`.${styles.msg}`);
  const ctxs = root.querySelectorAll<HTMLElement>(`.${styles.ctx}`);
  const aiBody = root.querySelector<HTMLElement>("#hero-ai-body");

  await sleep(150);
  messages[0]?.classList.add(styles.in);

  await sleep(350);
  messages[1]?.classList.add(styles.in);

  await sleep(600);
  if (aiBody) {
    aiBody.innerHTML = `<div style="display:flex;flex-direction:column;gap:6px"><div>Here&rsquo;s what the docs say about enterprise refunds:</div><div style="display:flex;gap:6px;align-items:baseline"><span class="${styles.cit}">1</span><span>Annual contracts are <b>non-refundable after 30 days</b>, but customers may pause service for up to 90 days within the term.</span></div><div style="display:flex;gap:6px;align-items:baseline"><span class="${styles.cit}">2</span><span>Exceptions above <b>$10,000</b> require sign-off from the <b>VP of Finance</b> per the March approvals matrix.</span></div><div style="display:flex;gap:6px;align-items:baseline"><span class="${styles.cit}">3</span><span>Deals over <b>$50,000</b> additionally require Legal to approve before the credit memo is issued.</span></div></div>
      <div class="${styles.sources}">
        <span class="${styles["src-chip"]}"><b>1</b> Customer Agreement v4.2 · Notion</span>
        <span class="${styles["src-chip"]}"><b>2</b> #finance-approvals · Slack · Mar 12</span>
        <span class="${styles["src-chip"]}"><b>3</b> Refunds Playbook · Drive · 2026</span>
      </div>`;

    const cits = aiBody.querySelectorAll<HTMLElement>(`.${styles.cit}`);
    for (const cit of cits) {
      await sleep(80);
      cit.classList.add(styles.in);
    }
    await sleep(80);
    const srcs = aiBody.querySelectorAll<HTMLElement>(`.${styles["src-chip"]}`);
    for (const src of srcs) {
      await sleep(60);
      src.classList.add(styles.in);
    }
  }

  await sleep(150);
  for (const ctx of ctxs) {
    await sleep(80);
    ctx.classList.add(styles.in);
  }
}
