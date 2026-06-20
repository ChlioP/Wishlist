import React, { useState } from 'react'

export default function AuthPage({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Please enter both name and email.')
      return
    }
    setError('')
    onLogin({ name: name.trim(), email: email.trim() })
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="logo-dot" />
          <div>
            <div className="auth-title">WishList Hub</div>
            <div className="auth-subtitle">Sign in to manage your rooms and wishlists.</div>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Alice Lee"
              autoFocus
            />
          </label>

          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="alice@example.com"
            />
          </label>

          {error ? <div className="form-error">{error}</div> : null}

          <button type="submit" className="btn-primary">Continue</button>
        </form>
      </div>
    </div>
  )
}
