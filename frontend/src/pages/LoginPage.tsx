import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import client from '../api/client'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ username: '', password: '', displayName: '' })
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(form.username, form.password)
      navigate('/')
    } catch {
      setError('ユーザー名またはパスワードが正しくありません')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await client.post('/auth/register', form)
      await login(form.username, form.password)
      navigate('/')
    } catch (err) {
      const msg = err instanceof Error ? err.message : '登録に失敗しました'
      setError(msg)
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '80px auto', padding: 24 }}>
      <h1 style={{ textAlign: 'center', marginBottom: 24 }}>💰 家計簿</h1>
      <div style={{ display: 'flex', marginBottom: 16 }}>
        <button onClick={() => setTab('login')}
          style={{ flex: 1, padding: 8, background: tab === 'login' ? '#1976d2' : '#eee', color: tab === 'login' ? '#fff' : '#333', border: 'none', cursor: 'pointer' }}>
          ログイン
        </button>
        <button onClick={() => setTab('register')}
          style={{ flex: 1, padding: 8, background: tab === 'register' ? '#1976d2' : '#eee', color: tab === 'register' ? '#fff' : '#333', border: 'none', cursor: 'pointer' }}>
          新規登録
        </button>
      </div>

      {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

      <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
        {tab === 'register' && (
          <div style={{ marginBottom: 12 }}>
            <label>表示名</label>
            <input style={{ display: 'block', width: '100%', padding: 8, boxSizing: 'border-box' }}
              value={form.displayName} onChange={e => setForm({ ...form, displayName: e.target.value })} required />
          </div>
        )}
        <div style={{ marginBottom: 12 }}>
          <label>ユーザー名</label>
          <input style={{ display: 'block', width: '100%', padding: 8, boxSizing: 'border-box' }}
            value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label>パスワード{tab === 'register' && '（6文字以上）'}</label>
          <input type="password" style={{ display: 'block', width: '100%', padding: 8, boxSizing: 'border-box' }}
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
        </div>
        <button type="submit" style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16 }}>
          {tab === 'login' ? 'ログイン' : '登録'}
        </button>
      </form>
    </div>
  )
}
