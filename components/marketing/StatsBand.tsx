'use client'

import { useEffect, useRef } from 'react'

const stats = [
  { target: 1.8, decimals: 1, suffix: 'h/day', label: 'Average knowledge worker time spent searching for internal information' },
  { target: 14, decimals: 0, suffix: '+ tools', label: "Where mid-sized teams' operational knowledge actually lives today" },
  { target: 60, decimals: 0, suffix: '%', label: 'Of repeated internal questions are answered by an existing doc somewhere' },
]

export default function StatsBand() {
  const bandRef = useRef<HTMLElement>(null)
  const played = useRef(false)

  useEffect(() => {
    const el = bandRef.current
    if (!el) return
    const io = new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting && !played.current) {
        played.current = true
        obs.disconnect()
        const counters = el.querySelectorAll<HTMLElement>('[data-target]')
        counters.forEach(counter => {
          const target = parseFloat(counter.dataset.target ?? '0')
          const decimals = parseInt(counter.dataset.decimals ?? '0', 10)
          const duration = 1200
          const start = performance.now()
          function tick(now: number) {
            const t = Math.min(1, (now - start) / duration)
            const eased = 1 - Math.pow(1 - t, 3)
            counter.textContent = (target * eased).toFixed(decimals)
            if (t < 1) requestAnimationFrame(tick)
            else counter.textContent = target.toFixed(decimals)
          }
          requestAnimationFrame(tick)
        })
      }
    }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section className="stats-band" ref={bandRef}>
      <div className="wrap">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat">
              <div className="num stat-num">
                <em data-target={s.target} data-decimals={s.decimals}>0</em>{s.suffix}
              </div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
