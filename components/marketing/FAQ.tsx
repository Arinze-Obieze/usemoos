'use client'

import { useState } from 'react'

const faqs = [
  {
    q: 'Who is usemoos for?',
    a: 'Modern organizations that operate across many tools and rely on internal knowledge sharing: fast-growing startups, mid-sized teams, and enterprise orgs. Anywhere employees waste time looking for "the doc on X," usemoos starts paying for itself in weeks.',
  },
  {
    q: 'Is usemoos secure?',
    a: 'Every workspace is fully isolated at the tenant boundary. Integration credentials, indexed content, employee accounts, and billing live in their own scope, never co-mingled with another organization\'s data. SOC 2 Type II is in progress; enterprise customers can request a dedicated environment.',
  },
  {
    q: 'How does usemoos respect existing permissions?',
    a: "usemoos mirrors source-level access controls per integration. If a teammate cannot open a Drive folder, they will not see it in answers, and usemoos will not use it to generate one either. Permission checks run on every query.",
  },
  {
    q: 'Will usemoos make things up?',
    a: 'Every answer is grounded in your sources and cites them inline. When usemoos is not confident, it says so instead of guessing. The platform prioritizes authoritative, recent, and role-relevant content to keep retrieval trustworthy.',
  },
  {
    q: 'How long does setup take?',
    a: 'Roughly 15 minutes of admin time to connect integrations. Indexing typically completes in under an hour for organizations up to 500 employees. Your team gets value the moment they ask their first question.',
  },
  {
    q: 'When can we get in?',
    a: "We're rolling out the private beta in batches by organization size and integration mix. Join the waitlist with your work email. Most teams hear back within 2 to 3 weeks.",
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number>(0)

  return (
    <section className="sec" id="faq">
      <div className="wrap">
        <div className="faq-grid">
          <div>
            <div className="sec-tag">FAQ</div>
            <h2 className="sec-title" style={{ marginBottom: '14px' }}>Quick answers.</h2>
            <p className="sec-sub">Have something else on your mind? Add it when you join the waitlist and we will reply.</p>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <div key={i} className="faq-item" data-open={open === i ? 'true' : 'false'}>
                <button className="faq-q" type="button" onClick={() => setOpen(open === i ? -1 : i)}>
                  {faq.q}<span className="pm">+</span>
                </button>
                <div className="faq-a"><p>{faq.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
