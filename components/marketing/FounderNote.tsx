export default function FounderNote() {
  return (
    <section className="py-[100px] max-[900px]:py-[72px] max-[600px]:py-[60px]">
      <div className="wrap">
        <div className="max-w-[880px] mx-auto text-center">
          <div className="sec-tag justify-center">A note from the team</div>
          <p className="text-[clamp(26px,2.8vw,38px)] leading-[1.25] tracking-[-0.02em] font-medium mb-7 [text-wrap:balance] max-[600px]:text-[22px]">
            We started usemoos because we kept watching brilliant teams ask the
            same questions twice, miss the doc that already had the answer, and
            lose half a day to a search box.{" "}
            <em className="em-underline">
              Org knowledge should not be a scavenger hunt.
            </em>
          </p>
          <div className="inline-flex items-center gap-3 text-[14px] max-[600px]:text-[13px]">
            <span className="w-9 h-9 rounded-full bg-ink text-accent grid place-items-center font-semibold text-[13px] shrink-0 max-[600px]:w-8 max-[600px]:h-8 max-[600px]:text-[12px]">
              IA
            </span>
            <span>
              <span className="text-ink font-semibold">Ifeanyi Awoke</span>
              {" · "}
              <span className="text-muted">Founder, usemoos</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
