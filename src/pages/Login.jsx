import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { findCharacterAccount } from '../services/authService'

export default function Login() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  async function handleLogin(event) {
    event.preventDefault()
    if (loading || !username.trim()) return

    setLoading(true)
    setError('')
    const { data, error: loginError } = await findCharacterAccount(username)

    if (loginError || !data) {
      setError('ไม่พบบัญชีตัวละครนี้ กรุณาตรวจสอบชื่อผู้ใช้อีกครั้ง')
      setLoading(false)
      return
    }

    login(data.id)
    navigate('/dashboard', { replace: true })
    setLoading(false)
  }

  return (
    <main className="login-page">
      <div className="login-ornament" aria-hidden="true">蘭</div>
      <section className="login-card">
        <div className="login-brand">
          <span>蘭州宮錄</span>
          <small>LANZHOU PALACE LEDGER</small>
        </div>
        <div className="login-heading">
          <h1>ยินดีต้อนรับสู่หลันโจว</h1>
        </div>
        <form onSubmit={handleLogin}>
          <label htmlFor="username">ชื่อผู้ใช้</label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            placeholder="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
          {error && <p className="form-error">{error}</p>}
          <button
            className="primary-button login-button"
            type="submit"
            disabled={loading || !username.trim()}
          >
            {loading ? 'กำลังเข้าสู่ตำหนัก...' : 'เข้าตำหนัก'}
          </button>
        </form>
        <small className="login-help">หากเข้าใช้งานไม่ได้ กรุณาติดต่อสต๊าฟคอมมู</small>
      </section>
    </main>
  )
}
