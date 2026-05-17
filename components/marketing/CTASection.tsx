import WaitlistForm from './WaitlistForm'

export default function CTASection() {
  return (
    <section className="cta-sec" id="waitlist">
      <div className="wrap inner">
        <h2>Stop searching. <em>Start asking</em>.</h2>
        <p>Join the private beta. We onboard new organizations in batches every week. No credit card, no sales call required to get in line.</p>
        <WaitlistForm id="cta" buttonLabel="Request access" />
        <div className="waitlist-meta">
          <span>SOC 2 in progress</span>
          <span className="sep" />
          <span>No credit card</span>
          <span className="sep" />
          <span>Reply in 2 to 3 weeks</span>
        </div>
      </div>
    </section>
  )
}
