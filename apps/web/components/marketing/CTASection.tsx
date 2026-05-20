import WaitlistForm from "./WaitlistForm";

export default function CTASection() {
  return (
    <section
      className="relative py-[120px] border-t border-line overflow-hidden text-center max-[900px]:py-[80px] max-[600px]:py-16"
      id="waitlist"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 w-[1000px] h-[700px] -translate-x-1/2 -translate-y-1/2 pointer-events-none max-[600px]:w-[600px] max-[600px]:h-[400px]"
        style={{
          background:
            "radial-gradient(ellipse, rgba(200, 255, 123, 0.35) 0%, transparent 60%)",
          filter: "blur(30px)",
        }}
      />

      <div className="wrap relative">
        <h2 className="text-[clamp(42px,5vw,68px)] tracking-[-0.03em] leading-none font-semibold mb-[18px] [text-wrap:balance] [&_em]:not-italic [&_em]:bg-accent [&_em]:text-accent-ink [&_em]:px-[0.12em] [&_em]:rounded-[6px] max-[900px]:text-[clamp(34px,6vw,50px)] max-[600px]:text-[clamp(30px,9vw,42px)]">
          Stop searching. <em>Start asking</em>.
        </h2>
        <p className="text-[18px] text-ink-2 max-w-[52ch] mx-auto mb-9 [text-wrap:pretty] max-[600px]:text-[16px] max-[600px]:mb-7">
          Join the private beta. We onboard new organizations in batches every
          week. No credit card, no sales call required to get in line.
        </p>
        <WaitlistForm id="cta" buttonLabel="Request access" />
        <div className="mt-[18px] flex flex-wrap gap-[14px] items-center justify-center font-mono text-[12px] text-muted">
          <span>SOC 2 in progress</span>
          <span className="w-[3px] h-[3px] rounded-full bg-dim max-[600px]:hidden" />
          <span>No credit card</span>
          <span className="w-[3px] h-[3px] rounded-full bg-dim max-[600px]:hidden" />
          <span>Reply in 2 to 3 weeks</span>
        </div>
      </div>
    </section>
  );
}
