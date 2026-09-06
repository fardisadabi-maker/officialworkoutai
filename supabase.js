const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseConfigMissing = !supabaseUrl || !supabaseAnonKey
const sessionKey = 'workoutai-supabase-session'
const listeners = new Set()

function notify(session) {
  listeners.forEach((listener) => listener('SIGNED_IN', session))
}

async function authRequest(path, body) {
  const response = await fetch(`${supabaseUrl}/auth/v1/${path}`, { method: 'POST', headers: { apikey: supabaseAnonKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) return { data: { session: null }, error: { message: data.error_description || data.msg || data.message || 'Authentication request failed.' } }
  return { data: { session: data.access_token ? data : null }, error: null }
}

export const supabase = supabaseConfigMissing ? null : {
  auth: {
    async getSession() {
      const session = JSON.parse(localStorage.getItem(sessionKey) || 'null')
      return { data: { session } }
    },
    onAuthStateChange(callback) {
      listeners.add(callback)
      return { data: { subscription: { unsubscribe: () => listeners.delete(callback) } } }
    },
    async signInWithPassword(credentials) {
      const result = await authRequest('token?grant_type=password', credentials)
      if (result.data.session) { localStorage.setItem(sessionKey, JSON.stringify(result.data.session)); notify(result.data.session) }
      return result
    },
    async signUp({ email, password, options }) {
      const result = await authRequest('signup', { email, password, data: options?.data })
      if (result.data.session) { localStorage.setItem(sessionKey, JSON.stringify(result.data.session)); notify(result.data.session) }
      return result
    },
    async signInWithOAuth({ provider, options }) {
      window.location.assign(`${supabaseUrl}/auth/v1/authorize?provider=${provider}&redirect_to=${encodeURIComponent(options?.redirectTo || window.location.origin)}`)
      return { error: null }
    },
    async signOut() {
      const session = JSON.parse(localStorage.getItem(sessionKey) || 'null')
      if (session?.access_token) await fetch(`${supabaseUrl}/auth/v1/logout`, { method: 'POST', headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${session.access_token}` } })
      localStorage.removeItem(sessionKey)
      listeners.forEach((listener) => listener('SIGNED_OUT', null))
      return { error: null }
    },
  },
  data: {
    async list(table, accessToken, query = '') {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=*${query}`, { headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}` } })
      const data = await response.json().catch(() => [])
      return response.ok ? { data, error: null } : { data: [], error: { message: data.message || 'Could not load nutrition data.' } }
    },
    async insert(table, record, accessToken) {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, { method: 'POST', headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(record) })
      const data = await response.json().catch(() => ({}))
      return response.ok ? { data, error: null } : { data: null, error: { message: data.message || 'Could not save nutrition data.' } }
    },
    async remove(table, id, accessToken) {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}` } })
      return { data: null, error: response.ok ? null : { message: 'Could not remove nutrition data.' } }
    },
    async update(table, id, record, accessToken) {
      const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { apikey: supabaseAnonKey, Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', Prefer: 'return=representation' }, body: JSON.stringify(record) })
      const data = await response.json().catch(() => ({}))
      return response.ok ? { data, error: null } : { data: null, error: { message: data.message || 'Could not update your list.' } }
    },
  },
}
