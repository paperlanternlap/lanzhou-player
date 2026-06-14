import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function Login() {
  const [username, setUsername] = useState('')
  const navigate = useNavigate()

  async function handleLogin() {
    const { data, error } = await supabase
      .from('characters')
      .select('*')
      .eq('username', username)
      .single()

    console.log('LOGIN USERNAME', username)
    console.log('LOGIN RESULT', data)
    console.log('LOGIN ERROR', error)

    if (error || !data) {
      alert('ไม่พบ Username นี้')
      return
    }

    localStorage.setItem('characterId', String(data.id))

    console.log('SAVED CHARACTER ID', localStorage.getItem('characterId'))

    navigate('/dashboard')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f1ea',
      }}
    >
      <div
        style={{
          width: '360px',
          background: '#fff',
          padding: '24px',
          borderRadius: '16px',
          border: '1px solid #ddd',
        }}
      >
        <h2>เข้าสู่ตำหนัก</h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '12px',
            borderRadius: '8px',
            border: '1px solid #ccc',
            boxSizing: 'border-box',
          }}
        />

        <button
          onClick={handleLogin}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          เข้าสู่ตำหนัก
        </button>
      </div>
    </div>
  )
}