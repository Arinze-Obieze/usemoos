"use client";

import { useEffect, useRef } from "react";
import styles from "./Marketing.module.css";
import { cx } from "./styleUtils";

const stats = [
  {
    target: 1.8,
    decimals: 1,
    suffix: "h/day",
    label:
      "Average knowledge worker time spent searching for internal information",
  },
  {
    target: 14,
    decimals: 0,
    suffix: "+ tools",
    label: "Where mid-sized teams' operational knowledge actually lives today",
  },
  {
    target: 60,
    decimals: 0,
    suffix: "%",
    label:
      "Of repeated internal questions are answered by an existing doc somewhere",
  },
];

export default function StatsBand() {
  const bandRef = useRef<HTMLElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = bandRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries, obs) => {
        if (entries[0].isIntersecting && !played.current) {
          played.current = true;
          obs.disconnect();
          const counters = el.querySelectorAll<HTMLElement>("[data-target]");
          counters.forEach((counter) => {
            const target = parseFloat(counter.dataset.target ?? "0");
            const decimals = parseInt(counter.dataset.decimals ?? "0", 10);
            const duration = 1200;
            const start = performance.now();
            function tick(now: number) {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - (1 - t) ** 3;
              counter.textContent = (target * eased).toFixed(decimals);
              if (t < 1) requestAnimationFrame(tick);
              else counter.textContent = target.toFixed(decimals);
            }
            requestAnimationFrame(tick);
          });
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className={cx(styles, "stats-band")} ref={bandRef}>
      <div className={cx(styles, "wrap")}>
        <div className={cx(styles, "stats-grid")}>
          {stats.map((s) => (
            <div key={s.label} className={cx(styles, "stat")}>
              <div className={cx(styles, "num")}>
                <em data-target={s.target} data-decimals={s.decimals}>
                  0
                </em>
                {s.suffix}
              </div>
              <div className={cx(styles, "lbl")}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
