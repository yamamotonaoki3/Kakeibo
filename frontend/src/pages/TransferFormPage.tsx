import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { searchUser, createTransfer } from '../api/groupApi'
import type { UserSearchResult } from '../types'

export default function TransferFormPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [candidates, setCandidates] = useState<UserSearchResult[]>([])
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
    setCandidates([])
    const r = await searchUser(searchQuery)
    if (r.data.length === 0) {
      setSearchError('ユーザーが見つかりません')
    } else {
      setCandidates(r.data)
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
            <label className="form-label">表示名で検索 *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="form-input"
                placeholder="相手の表示名を入力"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
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

        {candidates.length > 0 && !foundUser && (
          <div style={{ marginTop: 8 }}>
            {candidates.map(u => (
              <div
                key={u.id}
                onClick={() => { setFoundUser(u); setCandidates([]) }}
                style={{
                  padding: '10px 12px', marginBottom: 6,
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10
                }}
              >
                <span style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--color-primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 600, flexShrink: 0
                }}>
                  {u.displayName.charAt(0)}
                </span>
                <span style={{ fontWeight: 600 }}>{u.displayName}</span>
              </div>
            ))}
          </div>
        )}

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
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{foundUser.displayName}</div>
            </div>
            <button
              type="button"
              className="btn-outline btn-sm"
              onClick={() => setFoundUser(null)}
            >
              変更
            </button>
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
