import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { searchUser, createTransfer } from '../api/groupApi'
import type { UserSearchResult } from '../types'

export default function TransferFormPage() {
  const navigate = useNavigate()
  const [searchUsername, setSearchUsername] = useState('')
  const [foundUser, setFoundUser] = useState<UserSearchResult | null>(null)
  const [searchError, setSearchError] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setSearchError('')
    setFoundUser(null)
    try {
      const r = await searchUser(searchUsername)
      setFoundUser(r.data)
    } catch {
      setSearchError('ユーザーが見つかりません')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!foundUser) return
    setError('')
    try {
      await createTransfer({
        toUserId: foundUser.id,
        amount: Number(amount),
        memo,
        transferDate,
      })
      navigate('/splits')
    } catch (err: any) {
      setError(err.response?.data?.message ?? '登録に失敗しました')
    }
  }

  return (
    <Layout>
      <h2 style={{ marginBottom: 16, fontSize: 18 }}>送金を記録</h2>

      {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

      <div className="card" style={{ marginBottom: 12 }}>
        <p className="section-title">送金先の検索</p>
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label className="form-label">ユーザー名 *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                placeholder="相手のユーザー名を入力"
                value={searchUsername}
                onChange={e => setSearchUsername(e.target.value)}
                required
                style={{ flex: 1 }}
              />
              <button type="submit" className="btn-outline" style={{ whiteSpace: 'nowrap' }}>
                検索
              </button>
            </div>
          </div>
        </form>

        {searchError && <p style={{ color: 'var(--color-expense)', fontSize: 13, marginTop: 4 }}>{searchError}</p>}

        {foundUser && (
          <div style={{
            marginTop: 8, padding: '10px 12px',
            background: '#e8f5e9', borderRadius: 'var(--radius-sm)',
            display: 'flex', alignItems: 'center', gap: 10
          }}>
            <span style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--color-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 600, flexShrink: 0
            }}>
              {foundUser.displayName.charAt(0)}
            </span>
            <div>
              <div style={{ fontWeight: 600 }}>{foundUser.displayName}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>@{searchUsername}</div>
            </div>
          </div>
        )}
      </div>

      {foundUser && (
        <form onSubmit={handleSubmit}>
          <div className="card" style={{ marginBottom: 12 }}>
            <div className="form-group">
              <label className="form-label">日付 *</label>
              <input
                type="date"
                className="form-input"
                value={transferDate}
                onChange={e => setTransferDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">金額（円）*</label>
              <input
                type="number"
                className="form-input"
                placeholder="例：3000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                min={1}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">メモ</label>
              <input
                className="form-input"
                placeholder="例：先週の居酒屋代"
                value={memo}
                onChange={e => setMemo(e.target.value)}
              />
            </div>
          </div>

          <div style={{
            padding: '12px 16px', background: 'var(--color-bg)',
            borderRadius: 'var(--radius-sm)', marginBottom: 16,
            fontSize: 14, color: 'var(--color-text-sub)'
          }}>
            <strong style={{ color: 'var(--color-text)' }}>{foundUser.displayName}</strong> さんへ
            {amount ? <> <strong style={{ color: 'var(--color-primary)' }}>¥{Number(amount).toLocaleString()}</strong> を送金</> : ' の送金を記録'}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            登録する
          </button>
        </form>
      )}
    </Layout>
  )
}
