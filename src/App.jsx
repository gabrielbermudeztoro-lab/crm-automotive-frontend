import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)
const backendUrl = import.meta.env.VITE_BACKEND_URL

function App() {
  const [user, setUser] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [leads, setLeads] = useState([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  const signUp = async () => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('Revisa tu correo para confirmar la cuenta')
  }

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setLeads([])
  }

  const fetchLeads = async () => {
    if (!user) return alert('Debes iniciar sesión')
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session.access_token

    const res = await fetch(`${backendUrl}/api/leads`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    if (res.ok) {
      const data = await res.json()
      setLeads(data)
    } else {
      const error = await res.json()
      alert('Error: ' + (error.error || JSON.stringify(error)))
    }
  }

  if (!user)
    return (
      <div style={{ padding: 20 }}>
        <h1>Login / Registro CRM Automotriz</h1>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <br />
        <input
          placeholder="Contraseña"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <br />
        <button onClick={signIn}>Iniciar sesión</button>
        <button onClick={signUp}>Registrarse</button>
      </div>
    )

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido {user.email}</h1>
      <button onClick={signOut}>Cerrar sesión</button>
      <button onClick={fetchLeads}>Ver mis leads</button>

      <ul>
        {leads.map(lead => (
          <li key={lead.id}>
            {lead.fuente} - Estado: {lead.estado}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
