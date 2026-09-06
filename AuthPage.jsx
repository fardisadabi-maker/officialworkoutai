import { useState } from 'react'
import { supabase, supabaseConfigMissing } from './supabase.js'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (supabaseConfigMissing) {
      setError('Supabase is not configured yet. Add the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.')
      return
    }
    if (mode === 'signup' && password !== confirmation) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Your password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const result = mode === 'login' ? await supabase.auth.signInWithPassword({ email: email.trim(), password }) : await supabase.auth.signUp({ email: email.trim(), password, options: { data: { display_name: email.split('@')[0] } } })
    setLoading(false)
    if (result.error) setError(result.error.message)
    else if (mode === 'signup' && !result.data.session) setMessage('Account created. Check your email to confirm your account, then log in.')
  }

  async function googleSignIn() {
    setError('')
    if (supabaseConfigMissing) return setError('Supabase is not configured yet. Add the required environment variables.')
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
    if (signInError) { setLoading(false); setError(signInError.message) }
  }

  return <main className="auth-page"><div className="auth-visual"><div className="auth-brand-large"><span className="logo-symbol">W</span>workout<span>ai</span></div><div className="auth-quote"><p>TRAIN WITH<br /><em>INTENTION.</em></p><span>Your strongest self is built one session at a time.</span></div><div className="auth-orbit" /></div><section className="auth-panel"><div className="auth-panel-inner"><p className="kicker orange-text">YOUR TRAINING SPACE</p><h1>{mode === 'login' ? 'Welcome back.' : 'Start your journey.'}</h1><p className="auth-subtitle">{mode === 'login' ? 'Log in to pick up where you left off.' : 'Create your account and let WorkoutAI build your next session.'}</p><div className="auth-mode-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setMessage('') }}>Log in</button><button className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); setMessage('') }}>Create account</button></div><form className="supabase-auth-form" onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><label>Password<div className="auth-password"><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>{mode === 'signup' && <label>Confirm password<input type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="Repeat your password" autoComplete="new-password" required /></label>}{error && <p className="auth-form-error" role="alert">{error}</p>}{message && <p className="auth-form-message" role="status">{message}</p>}<button className="button-primary auth-submit-button" disabled={loading}>{loading ? 'Working...' : mode === 'login' ? 'Log In' : 'Create Account'} <span>{loading ? '...' : '→'}</span></button></form><div className="auth-divider"><span>or</span></div><button className="google-button" onClick={googleSignIn} disabled={loading}><span>G</span> Continue with Google</button><small className="auth-privacy">Secure authentication by Supabase. Workout data stays tied to your account.</small></div></section></main>
}
