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
  const [showPassword, setShowPassword] = useState(false)

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
    } catch {
      setError('登録に失敗しました。ユーザー名が既に使用されているか、パスワードが要件を満たしていません。')
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">💰</div>
          <div className="login-logo-title">Kakeibo</div>
          <div className="login-logo-sub">家計簿アプリ</div>
        </div>

        <div className="tab-switcher">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>
            ログイン
          </button>
          <button className={tab === 'register' ? 'active' : ''} onClick={() => setTab('register')}>
            新規登録
          </button>
        </div>

        {error && <p className="form-error" style={{ marginBottom: 12 }}>⚠ {error}</p>}

        <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
          {tab === 'register' && (
            <div className="form-group">
              <label className="form-label">表示名</label>
              <input
                className="form-input"
                placeholder="例：山田太郎"
                value={form.displayName}
                onChange={e => setForm({ ...form, displayName: e.target.value })}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">ユーザー名</label>
            <input
              className="form-input"
              placeholder="ユーザー名"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              パスワード{tab === 'register' && '（8文字以上・英数字混在）'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="パスワード"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-sub)', fontSize: 18, padding: 0, lineHeight: 1,
                }}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', padding: 12, fontSize: 15 }}>
            {tab === 'login' ? 'ログイン' : '登録する'}
          </button>
        </form>
      </div>
    </div>
  )
}
