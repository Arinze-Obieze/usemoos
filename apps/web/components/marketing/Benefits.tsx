const benefits = [
  {
    role: "For everyone",
    outcome: (
      <>
        <em className="em-badge">~9h</em>/mo
      </>
    ),
    heading: "Time reclaimed per employee.",
    body: "Stop chasing answers through 14 tools. Ask once, get a cited response in seconds, and get back to the work you were hired to do.",
    src: (
      <>
        Based on the <b>1.8h/day</b> knowledge-worker search figure (McKinsey)
      </>
    ),
  },
  {
    role: "For new hires",
    outcome: (
      <>
        <em className="em-badge">50%</em>
      </>
    ),
    heading: "Faster ramp to first impact.",
    body: "New hires self-serve answers about policies, codebases, and processes instead of pinging the busy senior who has the context locked in their head.",
    src: (
      <>
        Onboarding time observed across <b>beta cohorts</b>
      </>
    ),
  },
  {
    role: "For managers",
    outcome: (
      <>
        <em className="em-badge">−72%</em>
      </>
    ),
    heading: "Fewer repeat questions in your DMs.",
    body: 'The same "what\'s our policy on..." question gets asked dozens of times a quarter. usemoos answers it once with its source, every time after.',
    src: (
      <>
        Reduction in repeat asks across <b>#ask-x channels</b>
      </>
    ),
  },
  {
    role: "For operations",
    outcome: (
      <>
        <em className="em-badge">1</em> place
      </>
    ),
    heading: "End the tab-switching tax.",
    body: 'One workspace replaces hopping between Slack search, Notion search, Drive search, and "let me check Jira real quick." Cross-system context, one prompt.',
    src: (
      <>
        12+ tools queryable from <b>a single prompt</b>
      </>
    ),
  },
  {
    role: "For leadership",
    outcome: (
      <>
        <em className="em-badge">0</em> loss
      </>
    ),
    heading: "Institutional knowledge stays.",
    body: "When senior people leave, their context usually walks out with them. usemoos retains the answers, the threads, and the original sources, even after a reorg.",
    src: (
      <>
        Continuity across <b>departures &amp; reorgs</b>
      </>
    ),
  },
  {
    role: "For decision makers",
    outcome: (
      <>
        <em className="em-badge">100%</em>
      </>
    ),
    heading: "Decisions backed by the live source.",
    body: "Every answer cites the document, channel, or ticket it came from with a timestamp. Authoritative and recent docs always outrank stale ones.",
    src: (
      <>
        <b>Source-cited</b> retrieval on every response
      </>
    ),
  },
];

export default function Benefits() {
  return (
    <section className="sec" id="benefits">
      <div className="wrap">
        <div className="sec-head centered">
          <div className="sec-tag">Why teams join</div>
          <h2 className="sec-title">
            Six hours of meetings, gone.{" "}
            <em className="em-underline">Every week, per person.</em>
          </h2>
          <p className="sec-sub">
            What changes when your org&apos;s knowledge stops being a scavenger
            hunt. Outcomes are drawn directly from how teams already use usemoos
            in the private beta.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1">
          {benefits.map((b) => (
            <div
              key={b.heading}
              className="relative p-8 bg-surface border border-line rounded-[16px] flex flex-col transition-[border-color,transform,box-shadow] duration-[180ms] hover:border-line-2 hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] max-[900px]:py-[28px] max-[900px]:px-[22px] max-[600px]:py-6 max-[600px]:px-5"
            >
              <div className="font-mono text-[10.5px] tracking-[0.08em] uppercase text-muted mb-[22px] flex items-center gap-1.5">
                <span className="w-[5px] h-[5px] rounded-full bg-accent-2 shrink-0" />
                {b.role}
              </div>
              <div className="text-[42px] font-semibold tracking-[-0.03em] leading-none mb-3.5 text-ink max-[900px]:text-[36px] max-[600px]:text-[32px]">
                {b.outcome}
              </div>
              <h4 className="text-[17px] font-semibold tracking-[-0.015em] text-ink mb-2 max-[600px]:text-[16px]">
                {b.heading}
              </h4>
              <p className="text-[14.5px] text-ink-2 leading-[1.5] mb-[18px] [text-wrap:pretty] max-[600px]:text-[14px]">
                {b.body}
              </p>
              <div className="mt-auto font-mono text-[11px] text-muted pt-[14px] border-t border-line [&_b]:text-ink-2 [&_b]:font-medium max-[600px]:text-[10.5px] max-[600px]:pt-3">
                {b.src}
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <a className="btn btn-primary btn-lg" href="#waitlist">
            Get early access →
          </a>
        </div>
      </div>
    </section>
  );
}
