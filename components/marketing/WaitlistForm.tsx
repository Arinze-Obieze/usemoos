'use client'

import { useState } from 'react'

interface WaitlistFormProps {
  id: string
  buttonLabel?: string
  style?: React.CSSProperties
}

export default function WaitlistForm({ id, buttonLabel = 'Request access →', style }: WaitlistFormProps) {
  const [submitted, setSubmitted] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [showErr, setShowErr] = useState(false)
  const [value, setValue] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const email = value.trim()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    if (!valid) {
      setShowErr(true)
      return
    }
    setShowErr(false)
    setSubmittedEmail(email)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="waitlist-ok show" style={style}>
        <span className="check">✓</span>
        <span>
          {/* eslint-disable-next-line react/no-danger */}
          You&apos;re in line. We&apos;ll email <b>{submittedEmail}</b> when a slot opens.
        </span>
      </div>
    )
  }

  return (
    <>
      <form className="waitlist" data-id={id} noValidate onSubmit={handleSubmit} style={style}>
        <input
          type="email"
          name="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          value={value}
          onChange={e => { setValue(e.target.value); setShowErr(false) }}
        />
        <button type="submit">{buttonLabel}</button>
      </form>
      <div className={`waitlist-err${showErr ? ' show' : ''}`} data-err={id}>
        ↳ that doesn&apos;t look like a valid email
      </div>
    </>
  )
}
