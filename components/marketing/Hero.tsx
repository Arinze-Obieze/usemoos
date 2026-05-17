'use client'

import { useEffect, useRef } from 'react'
import WaitlistForm from './WaitlistForm'

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function Hero() {
  const mockRef = useRef<HTMLDivElement>(null)
  const played = useRef(false)

  useEffect(() => {
    const el = mockRef.current
    if (!el) return
    const io = new IntersectionObserver(async (entries, obs) => {
      if (entries[0].isIntersecting && !played.current) {
        played.current = true
        obs.disconnect()
        await playHeroMockup(el)
      }
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="hero">
      <div className="hero-bg" />
      <div className="hero-glow" />
      <div className="wrap hero-inner">
        <span className="eyebrow">
          <span className="pill"><span className="dot" />Waitlist open</span>
          Private beta · onboarding new orgs weekly
        </span>
        <h1 className="h1">Your company&apos;s <em>collective brain</em>, finally searchable.</h1>
        <p className="subhead">
          Stop losing two hours a day to &ldquo;where&rsquo;s the doc on...?&rdquo; usemoos connects Slack, Notion, Drive,
          GitHub, Jira, Confluence and 12+ other tools into one conversational workspace, with every answer cited and
          permission-checked.
        </p>
        <WaitlistForm id="hero" style={{ margin: '0 auto 14px' }} />
        <div className="hero-trust">
          <span className="item"><CheckIcon />Work email only</span>
          <span className="sep" />
          <span className="item"><CheckIcon />No credit card</span>
          <span className="sep" />
          <span className="item"><CheckIcon />Reply in 2 to 3 weeks</span>
        </div>

        <div className="mockup-stage" id="product">
          <div className="mockup" id="hero-mock" ref={mockRef}>
            <div className="mockup-bar">
              <div className="dots"><i /><i /><i /></div>
              <div className="url">app.usemoos.ai / acme</div>
              <div className="spacer" />
            </div>
            <div className="mockup-body">
              <aside className="mk-side">
                <div className="mk-side-block">
                  <div className="mk-side-label">Workspace</div>
                  <div className="mk-side-item active">
                    <svg className="ico" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4z" />
                    </svg>
                    Ask usemoos
                    <span className="kbd">⌘ K</span>
                  </div>
                  <div className="mk-side-item">
                    <svg className="ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
                    </svg>
                    Threads
                  </div>
                  <div className="mk-side-item">
                    <svg className="ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                    </svg>
                    Library
                  </div>
                  <div className="mk-side-item">
                    <svg className="ico" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15 15 0 010 20 15 15 0 010-20z" />
                    </svg>
                    Sources
                  </div>
                </div>
                <div className="mk-side-block">
                  <div className="mk-side-label">Recent threads</div>
                  <div className="mk-side-item">Q4 onboarding checklist</div>
                  <div className="mk-side-item">EU data residency policy</div>
                  <div className="mk-side-item">Pricing review · @nora</div>
                  <div className="mk-side-item">Incident post-mortem · 04/22</div>
                </div>
                <div className="mk-side-block">
                  <div className="mk-side-label">Connected · 12</div>
                  <div className="mk-side-item">
                    <span className="ico" style={{ fontWeight: 700, color: '#4A154B' }}>#</span> Slack
                    <span className="live-dot" />
                  </div>
                  <div className="mk-side-item">
                    <span className="ico" style={{ fontWeight: 700 }}>N</span> Notion
                    <span className="live-dot" />
                  </div>
                  <div className="mk-side-item">
                    <span className="ico" style={{ fontWeight: 700, color: '#161B22' }}>G</span> GitHub
                    <span className="live-dot" />
                  </div>
                  <div className="mk-side-item">
                    <span className="ico" style={{ fontWeight: 700, color: '#1FA463' }}>D</span> Drive
                    <span className="live-dot warn" />
                  </div>
                </div>
              </aside>

              <div className="mk-chat">
                <div className="msg user">
                  <div className="ava">JL</div>
                  <div className="body">What&apos;s our refund policy for annual enterprise contracts, and who approves exceptions over $10k?</div>
                </div>
                <div className="msg ai">
                  <div className="ava">✦</div>
                  <div className="body" id="hero-ai-body">
                    <span className="typedot"><i /><i /><i /></span>
                  </div>
                </div>
                <div className="mk-input">
                  <span className="star">✦</span>
                  <span className="ph">Ask anything across Slack, Notion, Drive, GitHub…</span>
                  <span className="send">↵</span>
                </div>
              </div>

              <aside className="mk-context">
                <h4>Sources for this answer</h4>
                <div className="ctx">
                  <div className="ctx-ico" style={{ background: '#0F1108' }}>N</div>
                  <div className="ctx-info">
                    <div className="ctx-title">Customer Agreement v4.2</div>
                    <div className="ctx-meta">Notion · Legal · 2d</div>
                  </div>
                  <div className="ctx-num">1</div>
                </div>
                <div className="ctx">
                  <div className="ctx-ico" style={{ background: '#4A154B' }}>#</div>
                  <div className="ctx-info">
                    <div className="ctx-title">#finance-approvals</div>
                    <div className="ctx-meta">Slack · @maya · Mar 12</div>
                  </div>
                  <div className="ctx-num">2</div>
                </div>
                <div className="ctx">
                  <div className="ctx-ico" style={{ background: '#1FA463' }}>D</div>
                  <div className="ctx-info">
                    <div className="ctx-title">Refunds Playbook 2026</div>
                    <div className="ctx-meta">Drive · Finance · v3</div>
                  </div>
                  <div className="ctx-num">3</div>
                </div>
                <h4>Access check</h4>
                <div className="ctx ctx-perm">
                  <div className="ctx-ico">✓</div>
                  <div className="ctx-info">
                    <div className="ctx-title">All 3 sources are in your scope</div>
                    <div className="ctx-meta">Permission-aware retrieval</div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

async function playHeroMockup(root: HTMLElement) {
  const messages = root.querySelectorAll<HTMLElement>('.msg')
  const ctxs = root.querySelectorAll<HTMLElement>('.ctx')
  const aiBody = root.querySelector<HTMLElement>('#hero-ai-body')

  await sleep(300)
  messages[0]?.classList.add('in')

  await sleep(700)
  messages[1]?.classList.add('in')

  await sleep(1400)
  if (aiBody) {
    aiBody.innerHTML = `Annual enterprise contracts are <b>non-refundable after 30 days</b>, but customers can pause service for up to 90 days within the term <span class="cit">1</span>. Refund exceptions above $10,000 require approval from the <b>VP of Finance</b> per the revised approvals matrix from March <span class="cit">2</span>. For deals over $50,000, Legal must sign off before the credit memo is issued <span class="cit">3</span>.
      <div class="sources">
        <span class="src-chip"><b>1</b> Customer Agreement v4.2 · Notion</span>
        <span class="src-chip"><b>2</b> #finance-approvals · Slack · Mar 12</span>
        <span class="src-chip"><b>3</b> Refunds Playbook · Drive · 2026</span>
      </div>`

    const cits = aiBody.querySelectorAll<HTMLElement>('.cit')
    for (const cit of cits) {
      await sleep(180)
      cit.classList.add('in')
    }
    await sleep(150)
    const srcs = aiBody.querySelectorAll<HTMLElement>('.src-chip')
    for (const src of srcs) {
      await sleep(120)
      src.classList.add('in')
    }
  }

  await sleep(300)
  for (const ctx of ctxs) {
    await sleep(180)
    ctx.classList.add('in')
  }
}
