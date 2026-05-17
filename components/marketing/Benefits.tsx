const benefits = [
  {
    role: 'For everyone',
    outcome: <><em>~9h</em>/mo</>,
    heading: 'Time reclaimed per employee.',
    body: 'Stop chasing answers through 14 tools. Ask once, get a cited response in seconds, and get back to the work you were hired to do.',
    src: <>Based on the <b>1.8h/day</b> knowledge-worker search figure (McKinsey)</>,
  },
  {
    role: 'For new hires',
    outcome: <><em>50%</em></>,
    heading: 'Faster ramp to first impact.',
    body: 'New hires self-serve answers about policies, codebases, and processes instead of pinging the busy senior who has the context locked in their head.',
    src: <>Onboarding time observed across <b>beta cohorts</b></>,
  },
  {
    role: 'For managers',
    outcome: <><em>−72%</em></>,
    heading: 'Fewer repeat questions in your DMs.',
    body: 'The same "what\'s our policy on..." question gets asked dozens of times a quarter. usemoos answers it once with its source, every time after.',
    src: <>Reduction in repeat asks across <b>#ask-x channels</b></>,
  },
  {
    role: 'For operations',
    outcome: <><em>1</em> place</>,
    heading: 'End the tab-switching tax.',
    body: 'One workspace replaces hopping between Slack search, Notion search, Drive search, and "let me check Jira real quick." Cross-system context, one prompt.',
    src: <>12+ tools queryable from <b>a single prompt</b></>,
  },
  {
    role: 'For leadership',
    outcome: <><em>0</em> loss</>,
    heading: 'Institutional knowledge stays.',
    body: 'When senior people leave, their context usually walks out with them. usemoos retains the answers, the threads, and the original sources, even after a reorg.',
    src: <>Continuity across <b>departures &amp; reorgs</b></>,
  },
  {
    role: 'For decision makers',
    outcome: <><em>100%</em></>,
    heading: 'Decisions backed by the live source.',
    body: 'Every answer cites the document, channel, or ticket it came from with a timestamp. Authoritative and recent docs always outrank stale ones.',
    src: <><b>Source-cited</b> retrieval on every response</>,
  },
]

export default function Benefits() {
  return (
    <section className="sec" id="benefits">
      <div className="wrap">
        <div className="sec-head centered">
          <div className="sec-tag">Why teams join</div>
          <h2 className="sec-title">Six hours of meetings, gone. <em>Every week, per person.</em></h2>
          <p className="sec-sub">What changes when your org&apos;s knowledge stops being a scavenger hunt. Outcomes are drawn directly from how teams already use usemoos in the private beta.</p>
        </div>
        <div className="benefits-grid">
          {benefits.map((b, i) => (
            <div key={i} className="benefit">
              <div className="role">{b.role}</div>
              <div className="outcome">{b.outcome}</div>
              <h4>{b.heading}</h4>
              <p>{b.body}</p>
              <div className="src">{b.src}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <a className="btn btn-primary btn-lg" href="#waitlist">Get early access →</a>
        </div>
      </div>
    </section>
  )
}
