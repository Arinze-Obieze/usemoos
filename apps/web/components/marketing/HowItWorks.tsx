const steps = [
  {
    num: "01",
    heading: "Connect the stack.",
    body: "Sign in with your work email, click through OAuth on the tools you use, and watch usemoos pull in your knowledge graph. No data migration. Nothing to install on employee machines.",
  },
  {
    num: "02",
    heading: "Index, privately.",
    body: "Content is processed inside your isolated workspace, with permission boundaries preserved at the source level. Indexing typically completes in under an hour for orgs up to 500 employees.",
  },
  {
    num: "03",
    heading: "Ask, anywhere.",
    body: "Use usemoos in the web app, as a Slack bot, or via a global hotkey on macOS and Windows. Every answer is cited, traceable, and respects who-can-see-what.",
  },
];

export default function HowItWorks() {
  return (
    <section className="sec" id="how">
      <div className="wrap">
        <div className="sec-head">
          <div className="sec-tag">Onboarding</div>
          <h2 className="sec-title">
            From scattered to searchable in{" "}
            <em className="em-underline">an afternoon</em>.
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-4 max-[900px]:grid-cols-1 max-[900px]:gap-3">
          {steps.map((s) => (
            <div
              key={s.num}
              className="p-8 border border-line rounded-[16px] bg-surface max-[900px]:py-[26px] max-[900px]:px-[22px]"
            >
              <div className="font-mono text-[12px] text-accent-ink tracking-[0.1em] mb-[22px]">
                {s.num}
              </div>
              <h4 className="text-[22px] font-semibold tracking-[-0.02em] mb-[10px] leading-[1.15] max-[600px]:text-[20px]">
                {s.heading}
              </h4>
              <p className="text-[15px] leading-[1.55] text-ink-2 [text-wrap:pretty] max-[600px]:text-[14.5px]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
