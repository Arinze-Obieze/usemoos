"use client";

import { useEffect, useRef } from "react";
import styles from "./Features.module.css";
import { cx } from "./styleUtils";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function onVisible(el: Element, fn: () => void, threshold = 0.3) {
  const io = new IntersectionObserver(
    async (entries, obs) => {
      if (entries[0].isIntersecting) {
        obs.disconnect();
        fn();
      }
    },
    { threshold },
  );
  io.observe(el);
  return io;
}

/* ── Search Mock ── */
function SearchMock() {
  const ref = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = onVisible(el, async () => {
      if (played.current) return;
      played.current = true;
      const typedEl = el.querySelector<HTMLElement>(`.${styles.typed}`);
      const countEl = el.querySelector<HTMLElement>(`.${styles.count}`);
      const results = el.querySelectorAll<HTMLElement>(`.${styles.result}`);
      const query = "how do we handle PTO for contractors in Germany?";
      if (typedEl) {
        typedEl.textContent = "";
        for (const char of query) {
          typedEl.textContent += char;
          await sleep(28 + Math.random() * 30);
        }
      }
      await sleep(400);
      if (countEl) countEl.textContent = "4 results";
      for (const result of results) {
        await sleep(120);
        result.classList.add(styles.in);
      }
    });
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={cx(styles, "feat-mock search-mock")}
      id="search-mock"
      ref={ref}
    >
      <div className={cx(styles, "search-bar")}>
        <span className={cx(styles, "ico")}>✦</span>
        <span className={cx(styles, "typed")} />
        <span className={cx(styles, "caret")} />
      </div>
      <div className={cx(styles, "results-label")}>
        <span>Results from 4 systems</span>
        <span className={cx(styles, "count")} />
      </div>
      <div className={cx(styles, "result")}>
        <div
          className={cx(styles, "result-ico")}
          style={{ background: "#0F1108" }}
        >
          N
        </div>
        <div className={cx(styles, "result-info")}>
          <div className={cx(styles, "result-title")}>
            People Handbook v12 · §4.2 Contractor leave
          </div>
          <div className={cx(styles, "result-meta")}>
            Notion · HR · updated Mar 2026
          </div>
        </div>
        <span className={cx(styles, "result-score")}>98%</span>
      </div>
      <div className={cx(styles, "result")}>
        <div
          className={cx(styles, "result-ico")}
          style={{ background: "#4A154B" }}
        >
          #
        </div>
        <div className={cx(styles, "result-info")}>
          <div className={cx(styles, "result-title")}>
            &ldquo;Updated EU contractor PTO rules&rdquo; — @maya
          </div>
          <div className={cx(styles, "result-meta")}>
            Slack · #hr-policy · Mar 12
          </div>
        </div>
        <span className={cx(styles, "result-score")}>94%</span>
      </div>
      <div className={cx(styles, "result")}>
        <div
          className={cx(styles, "result-ico")}
          style={{ background: "#1FA463" }}
        >
          D
        </div>
        <div className={cx(styles, "result-info")}>
          <div className={cx(styles, "result-title")}>
            EU Contractor Agreement · Germany template
          </div>
          <div className={cx(styles, "result-meta")}>Drive · Legal · v3</div>
        </div>
        <span className={cx(styles, "result-score")}>91%</span>
      </div>
      <div className={cx(styles, "result")}>
        <div
          className={cx(styles, "result-ico")}
          style={{ background: "#0B66C2" }}
        >
          C
        </div>
        <div className={cx(styles, "result-info")}>
          <div className={cx(styles, "result-title")}>
            Compliance notes · EU statutory leave
          </div>
          <div className={cx(styles, "result-meta")}>
            Confluence · Operations
          </div>
        </div>
        <span className={cx(styles, "result-score")}>86%</span>
      </div>
    </div>
  );
}

/* ── Permissions Mock ── */
function PermMock() {
  const ref = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = onVisible(el, async () => {
      if (played.current) return;
      played.current = true;
      const docs = el.querySelectorAll<HTMLElement>(`.${styles.doc}`);
      for (const doc of docs) {
        await sleep(200);
        doc.classList.add(styles.in);
      }
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className={cx(styles, "feat-mock perm-mock")} id="perm-mock" ref={ref}>
      <div className={cx(styles, "perm-header")}>
        <div className={cx(styles, "who")}>JL</div>
        <div>
          <div className={cx(styles, "name")}>Jordan Lee · IC Engineer</div>
          <div className={cx(styles, "role")}>@jordan.lee · joined 2024</div>
        </div>
      </div>
      <div className={cx(styles, "perm-label")}>
        Access scope · 4 of 6 documents
      </div>
      <div className={cx(styles, "doc")}>
        <div
          className={cx(styles, "doc-ico")}
          style={{ background: "#0F1108" }}
        >
          N
        </div>
        <div className={cx(styles, "doc-name")}>
          Engineering RFC #214 · Storage sharding
        </div>
        <span className={cx(styles, "doc-status ok")}>✓ Access</span>
      </div>
      <div className={cx(styles, "doc deny")}>
        <div
          className={cx(styles, "doc-ico")}
          style={{ background: "#1FA463" }}
        >
          D
        </div>
        <div className={cx(styles, "doc-name")}>Q3 board deck</div>
        <span className={cx(styles, "doc-status deny")}>✕ No access</span>
      </div>
      <div className={cx(styles, "doc")}>
        <div
          className={cx(styles, "doc-ico")}
          style={{ background: "#4A154B" }}
        >
          #
        </div>
        <div className={cx(styles, "doc-name")}>
          #eng-incident-2026-04-22 channel
        </div>
        <span className={cx(styles, "doc-status ok")}>✓ Access</span>
      </div>
      <div className={cx(styles, "doc")}>
        <div
          className={cx(styles, "doc-ico")}
          style={{ background: "#161B22" }}
        >
          G
        </div>
        <div className={cx(styles, "doc-name")}>
          usemoos/api-server · main branch
        </div>
        <span className={cx(styles, "doc-status ok")}>✓ Access</span>
      </div>
      <div className={cx(styles, "doc deny")}>
        <div
          className={cx(styles, "doc-ico")}
          style={{ background: "#0F1108" }}
        >
          N
        </div>
        <div className={cx(styles, "doc-name")}>
          Comp bands · senior leadership
        </div>
        <span className={cx(styles, "doc-status deny")}>✕ No access</span>
      </div>
      <div className={cx(styles, "doc")}>
        <div
          className={cx(styles, "doc-ico")}
          style={{ background: "#0052CC" }}
        >
          J
        </div>
        <div className={cx(styles, "doc-name")}>
          PROJ-1248 · Sprint 32 retro
        </div>
        <span className={cx(styles, "doc-status ok")}>✓ Access</span>
      </div>
    </div>
  );
}

/* ── Sync Mock ── */
function SyncMock() {
  const ref = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = onVisible(el, async () => {
      if (played.current) return;
      played.current = true;
      const flows = el.querySelectorAll<HTMLElement>(`.${styles["flow-line"]}`);
      for (const flow of flows) {
        await sleep(280);
        flow.classList.add(styles.in);
      }
      startSyncTicker(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className={cx(styles, "feat-mock sync-mock")} id="sync-mock" ref={ref}>
      <div className={cx(styles, "sync-header")}>
        <span className={cx(styles, "title")}>Sync status</span>
        <span className={cx(styles, "badge")}>All systems healthy</span>
      </div>
      <div className={cx(styles, "sync-row")}>
        <div className={cx(styles, "icoR")} style={{ background: "#4A154B" }}>
          #
        </div>
        <div className={cx(styles, "name")}>Slack</div>
        <div className={cx(styles, "meta")}>
          <span data-tick="2">
            <b>2s</b> ago
          </span>
        </div>
        <div className={cx(styles, "pulse-dot")} />
      </div>
      <div className={cx(styles, "sync-row")}>
        <div className={cx(styles, "icoR")} style={{ background: "#0F1108" }}>
          N
        </div>
        <div className={cx(styles, "name")}>Notion</div>
        <div className={cx(styles, "meta")}>
          <span data-tick="14">
            <b>14s</b> ago
          </span>
        </div>
        <div className={cx(styles, "pulse-dot")} />
      </div>
      <div className={cx(styles, "sync-row")}>
        <div className={cx(styles, "icoR")} style={{ background: "#1FA463" }}>
          D
        </div>
        <div className={cx(styles, "name")}>Google Drive</div>
        <div className={cx(styles, "meta")}>
          <span data-tick="38">
            <b>38s</b> ago
          </span>
        </div>
        <div className={cx(styles, "pulse-dot warn")} />
      </div>
      <div className={cx(styles, "sync-row")}>
        <div className={cx(styles, "icoR")} style={{ background: "#161B22" }}>
          G
        </div>
        <div className={cx(styles, "name")}>GitHub</div>
        <div className={cx(styles, "meta")}>
          <span data-tick="4">
            <b>4s</b> ago
          </span>
        </div>
        <div className={cx(styles, "pulse-dot")} />
      </div>
      <div className={cx(styles, "sync-flow")}>
        <div className={cx(styles, "flow-label")}>Indexing pipeline · live</div>
        <div className={cx(styles, "flow-line")}>
          <span className={cx(styles, "step-ico")}>›</span>
          <span className={cx(styles, "lbl")}>
            3 documents updated in <b>Notion</b>
          </span>
          <span className={cx(styles, "t")}>just now</span>
        </div>
        <div className={cx(styles, "flow-line")}>
          <span className={cx(styles, "step-ico")}>›</span>
          <span className={cx(styles, "lbl")}>
            Embedded &amp; re-indexed in workspace
          </span>
          <span className={cx(styles, "t")}>2s</span>
        </div>
        <div className={cx(styles, "flow-line")}>
          <span className={cx(styles, "step-ico")}>›</span>
          <span className={cx(styles, "lbl")}>
            Permission scope recalculated
          </span>
          <span className={cx(styles, "t")}>3s</span>
        </div>
        <div className={cx(styles, "flow-line")}>
          <span className={cx(styles, "step-ico")}>›</span>
          <span className={cx(styles, "lbl")}>
            Available in answers across workspace
          </span>
          <span className={cx(styles, "t")}>4s</span>
        </div>
      </div>
    </div>
  );
}

function startSyncTicker(root: HTMLElement) {
  const tickEls = root.querySelectorAll<HTMLElement>("[data-tick]");
  let counter = 0;
  setInterval(() => {
    counter++;
    for (const el of tickEls) {
      const base = parseInt(el.dataset.tick ?? "0", 10);
      const t = base + counter * 3;
      if (t < 60) el.innerHTML = `<b>${t}s</b> ago`;
      else if (t < 3600) el.innerHTML = `<b>${Math.floor(t / 60)}m</b> ago`;
      else el.innerHTML = `<b>${Math.floor(t / 3600)}h</b> ago`;
    }
  }, 3000);
}

/* ── Thread Mock ── */
function ThreadMock() {
  const ref = useRef<HTMLDivElement>(null);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = onVisible(el, async () => {
      if (played.current) return;
      played.current = true;
      const msgs = el.querySelectorAll<HTMLElement>(`.${styles["thread-msg"]}`);
      const regen = el.querySelector<HTMLElement>(`.${styles["regen-bar"]}`);
      for (const msg of msgs) {
        await sleep(450);
        msg.classList.add(styles.in);
      }
      await sleep(350);
      regen?.classList.add(styles.in);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div
      className={cx(styles, "feat-mock thread-mock")}
      id="thread-mock"
      ref={ref}
    >
      <div className={cx(styles, "thread-head")}>
        <span className={cx(styles, "thread-title")}>
          Refund policy · annual contracts
        </span>
        <span className={cx(styles, "thread-meta")}>4 messages</span>
      </div>
      <div className={cx(styles, "thread-msg user")}>
        <div className={cx(styles, "ava")}>JL</div>
        <div className={cx(styles, "bub")}>
          What&apos;s our refund policy for annual enterprise contracts?
        </div>
      </div>
      <div className={cx(styles, "thread-msg ai")}>
        <div className={cx(styles, "ava")}>✦</div>
        <div className={cx(styles, "bub")}>
          Non-refundable after 30 days, with up to 90 days of paused service.
          Exceptions over $10k need <b>VP Finance</b> approval.
        </div>
      </div>
      <div className={cx(styles, "thread-msg user")}>
        <div className={cx(styles, "ava")}>JL</div>
        <div className={cx(styles, "bub")}>
          Has anyone shipped a refund over $50k recently?
        </div>
      </div>
      <div className={cx(styles, "thread-msg ai")}>
        <div className={cx(styles, "ava")}>✦</div>
        <div className={cx(styles, "bub")}>
          Yes. <b>Three</b> in the last 90 days. The largest was a $74,000
          partial credit to <b>Vellum Health</b> after a contract scope
          reduction, signed off by Legal on April 8.
        </div>
      </div>
      <div className={cx(styles, "regen-bar")}>
        <button type="button">↻ Regenerate</button>
        <button type="button">+ Add source</button>
        <button type="button">↗ Share</button>
      </div>
    </div>
  );
}

/* ── Main Features Section ── */
export default function Features() {
  return (
    <section className={cx(styles, "sec")}>
      <div className={cx(styles, "wrap")}>
        <div className={cx(styles, "sec-head centered")}>
          <div className={cx(styles, "sec-tag")}>Capabilities</div>
          <h2 className={cx(styles, "sec-title")}>
            One question. Every system. A <em>cited answer</em>.
          </h2>
          <p className={cx(styles, "sec-sub")}>
            Four capabilities that make usemoos different from a smarter search
            bar or another chatbot bolted onto your wiki.
          </p>
        </div>

        <div className={cx(styles, "feature-split feature-spaced")}>
          <div className={cx(styles, "feat-copy")}>
            <div className={cx(styles, "sec-tag")}>
              01 · Cross-system search
            </div>
            <h3>
              Ask in plain English. Get answers from <em>every system</em>.
            </h3>
            <p>
              One query reaches across Slack, Notion, Drive, GitHub, Jira,
              Confluence, and a dozen others. usemoos ranks results by authority
              and recency, then synthesizes them into a single answer with every
              source linked inline.
            </p>
            <ul className={cx(styles, "feat-bullets")}>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  Natural-language queries. <b>No syntax to learn.</b>
                </span>
              </li>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  Cross-system synthesis. One answer from many sources.
                </span>
              </li>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  <b>Authoritative sources outrank stale ones</b> by default.
                </span>
              </li>
            </ul>
          </div>
          <SearchMock />
        </div>

        <div className={cx(styles, "feature-split flip feature-spaced")}>
          <div className={cx(styles, "feat-copy")}>
            <div className={cx(styles, "sec-tag")}>02 · Permission-aware</div>
            <h3>
              Employees only see what they were <em>already allowed</em> to see.
            </h3>
            <p>
              usemoos mirrors source-level access controls from every connected
              system. If a teammate can&apos;t open a Drive folder in its native
              app, that folder won&apos;t appear in their answers and won&apos;t
              be used to generate one either. Permission checks run on every
              query.
            </p>
            <ul className={cx(styles, "feat-bullets")}>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>Source-level access mirrored from each integration.</span>
              </li>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  <b>Per-query checks.</b> No shortcuts, no caching of access
                  decisions.
                </span>
              </li>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  Admin audit log of every retrieval and source touched.
                </span>
              </li>
            </ul>
          </div>
          <PermMock />
        </div>

        <div className={cx(styles, "feature-split feature-spaced")}>
          <div className={cx(styles, "feat-copy")}>
            <div className={cx(styles, "sec-tag")}>03 · Always in sync</div>
            <h3>
              Knowledge changes propagate in{" "}
              <em>minutes, not nightly batches</em>.
            </h3>
            <p>
              usemoos uses event-driven syncing where the source platform
              supports it, and intelligent polling everywhere else. Every answer
              reflects the most recent authoritative version. Sync status is
              visible to admins at all times.
            </p>
            <ul className={cx(styles, "feat-bullets")}>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  Event-driven where available, fast polling everywhere else.
                </span>
              </li>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  Per-source sync health visible to admins,{" "}
                  <b>with alerts on stale data</b>.
                </span>
              </li>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  Re-indexing on edits, deletes, and permission changes.
                </span>
              </li>
            </ul>
          </div>
          <SyncMock />
        </div>

        <div className={cx(styles, "feature-split flip")}>
          <div className={cx(styles, "feat-copy")}>
            <div className={cx(styles, "sec-tag")}>
              04 · Threaded conversations
            </div>
            <h3>
              Follow up, refine, regenerate. <em>Conversations, not queries</em>
              .
            </h3>
            <p>
              usemoos keeps full conversational context so your team gets to the
              right answer in fewer turns. Every message is grounded in its own
              sources, and admins can audit every retrieval that fed the
              response.
            </p>
            <ul className={cx(styles, "feat-bullets")}>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>Persistent threads scoped to the workspace.</span>
              </li>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  <b>Regenerate</b> with refined context or different sources.
                </span>
              </li>
              <li>
                <span className={cx(styles, "check")}>✓</span>
                <span>
                  Shareable threads across teammates with the right access.
                </span>
              </li>
            </ul>
          </div>
          <ThreadMock />
        </div>
      </div>
    </section>
  );
}
