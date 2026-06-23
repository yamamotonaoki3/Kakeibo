import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ConfirmDialog from '../components/ConfirmDialog'
import client from '../api/client'
import type { Account } from '../types'

export default function AccountsPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [form, setForm] = useState({ name: '', initialBalance: '0' })
  const [editId, setEditId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Account | null>(null)

  const load = () => client.get<Account[]>('/accounts').then(r => setAccounts(r.data))
  useEffect(() => { load() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { name: form.name, initialBalance: Number(form.initialBalance) }
      if (editId !== null) {
        await client.put(`/accounts/${editId}`, payload)
        setEditId(null)
      } else {
        await client.post('/accounts', payload)
      }
      setForm({ name: '', initialBalance: '0' })
      load()
    } catch {
      setError('保存に失敗しました')
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await client.delete(`/accounts/${deleteTarget.id}`)
    setDeleteTarget(null)
    load()
  }

  const startEdit = (a: Account) => {
    setEditId(a.id)
    setForm({ name: a.name, initialBalance: String(a.initialBalance) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Layout>
      <h2 style={{ marginBottom: 16, fontSize: 18 }}>口座管理</h2>

      <div className="card" style={{ marginBottom: 20 }}>
        <p className="section-title">{editId !== null ? '口座を編集' : '口座を追加'}</p>
        {error && <p className="form-error" style={{ marginBottom: 8 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">口座名 *</label>
            <input
              className="form-input"
              placeholder="例：楽天銀行"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">初期残高（円）</label>
            <input
              type="number"
              className="form-input"
              value={form.initialBalance}
              onChange={e => setForm({ ...form, initialBalance: e.target.value })}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {editId !== null && (
              <button type="button" className="btn-outline" onClick={() => { setEditId(null); setForm({ name: '', initialBalance: '0' }) }}>
                キャンセル
              </button>
            )}
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              {editId !== null ? '更新する' : '追加する'}
            </button>
          </div>
        </form>
      </div>

      <p className="section-title">登録済み口座</p>
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 16 }}>
        {accounts.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-sub)' }}>口座が登録されていません</p>
        ) : (
          accounts.map((a, i) => (
            <div key={a.id} style={{
              padding: '14px 16px',
              borderBottom: i < accounts.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                    初期残高 ¥{a.initialBalance.toLocaleString()}
                    <span style={{ margin: '0 2px' }}>現在</span>
                    <span style={{ fontWeight: 600, color: a.balance >= 0 ? 'var(--color-positive)' : 'var(--color-expense)' }}>
                      ¥{a.balance.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn-outline btn-sm" onClick={() => startEdit(a)}>編集</button>
                  <button
                    className="btn-sm"
                    style={{ background: '#ffebee', color: 'var(--color-expense)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '5px 12px', fontSize: 12 }}
                    onClick={() => setDeleteTarget(a)}
                  >
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card" style={{ background: 'var(--color-bg)' }}>
        <p style={{ fontSize: 13, color: 'var(--color-text-sub)', marginBottom: 10 }}>カテゴリの管理はこちら</p>
        <button className="btn-outline" style={{ width: '100%' }} onClick={() => navigate('/categories')}>
          🏷️ カテゴリ管理へ
        </button>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="口座を削除（アーカイブ）しますか？"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="アーカイブする"
      >
        {deleteTarget && (
          <>
            「{deleteTarget.name}」<br /><br />
            ※ 過去の取引データは残ります<br />
            ※ 入力画面の選択肢から消えます
          </>
        )}
      </ConfirmDialog>
    </Layout>
  )
}
