export default function FounderNote() {
  return (
    <section className="note-sec">
      <div className="wrap">
        <div className="note">
          <div className="sec-tag" style={{ justifyContent: 'center', display: 'inline-flex' }}>A note from the team</div>
          <p className="q">
            We started usemoos because we kept watching brilliant teams ask the same questions twice, miss the doc that
            already had the answer, and lose half a day to a search box.{' '}
            <em>Org knowledge should not be a scavenger hunt.</em>
          </p>
          <div className="who">
            <span className="av">AO</span>
            <span>
              <span className="name">Arinze Obieze</span> · <span className="role">Founder, usemoos</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
