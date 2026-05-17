const steps = [
  {
    num: '01',
    heading: 'Connect the stack.',
    body: 'Sign in with your work email, click through OAuth on the tools you use, and watch usemoos pull in your knowledge graph. No data migration. Nothing to install on employee machines.',
  },
  {
    num: '02',
    heading: 'Index, privately.',
    body: 'Content is processed inside your isolated workspace, with permission boundaries preserved at the source level. Indexing typically completes in under an hour for orgs up to 500 employees.',
  },
  {
    num: '03',
    heading: 'Ask, anywhere.',
    body: 'Use usemoos in the web app, as a Slack bot, or via a global hotkey on macOS and Windows. Every answer is cited, traceable, and respects who-can-see-what.',
  },
]

export default function HowItWorks() {
  return (
    <section className="sec" id="how">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-tag">Onboarding</div>
          <h2 className="sec-title">From scattered to searchable in <em>an afternoon</em>.</h2>
        </div>
        <div className="how-grid">
          {steps.map(s => (
            <div key={s.num} className="how-step">
              <div className="how-num">{s.num}</div>
              <h4>{s.heading}</h4>
              <p>{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
