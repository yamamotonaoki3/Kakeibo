import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import type { Account } from '../types'

export default function AccountsPage() {
  const navigate = useNavigate()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [form, setForm] = useState({ name: '', initialBalance: '0' })
  const [editId, setEditId] = useState<number | null>(null)
  const [error, setError] = useState('')

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
    } catch (err: any) {
      setError(err.response?.data?.message || '保存に失敗しました')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await client.delete(`/accounts/${id}`)
    load()
  }

  const handleEdit = (a: Account) => {
    setEditId(a.id)
    setForm({ name: a.name, initialBalance: String(a.initialBalance) })
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={() => navigate('/')}>← カレンダーへ</button>
        <h2 style={{ margin: 0 }}>口座管理</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px' }}>{editId !== null ? '口座を編集' : '口座を追加'}</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <label style={{ flex: 2 }}>口座名
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required style={{ display: 'block', width: '100%', padding: 6 }} />
          </label>
          <label style={{ flex: 1 }}>初期残高（円）
            <input type="number" value={form.initialBalance} onChange={e => setForm({ ...form, initialBalance: e.target.value })} style={{ display: 'block', width: '100%', padding: 6 }} />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '6px 16px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {editId !== null ? '更新' : '追加'}
          </button>
          {editId !== null && <button type="button" onClick={() => { setEditId(null); setForm({ name: '', initialBalance: '0' }) }}>キャンセル</button>}
        </div>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>口座名</th>
            <th style={{ padding: 8, textAlign: 'right' }}>初期残高</th>
            <th style={{ padding: 8, textAlign: 'right' }}>現在残高</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {accounts.map(a => (
            <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{a.name}</td>
              <td style={{ padding: 8, textAlign: 'right' }}>¥{a.initialBalance.toLocaleString()}</td>
              <td style={{ padding: 8, textAlign: 'right', fontWeight: 'bold', color: a.balance >= 0 ? '#388e3c' : '#d32f2f' }}>
                ¥{a.balance.toLocaleString()}
              </td>
              <td style={{ padding: 8, display: 'flex', gap: 4 }}>
                <button onClick={() => handleEdit(a)} style={{ fontSize: 12 }}>編集</button>
                <button onClick={() => handleDelete(a.id)} style={{ fontSize: 12, color: '#d32f2f' }}>削除</button>
              </td>
            </tr>
          ))}
          {accounts.length === 0 && <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: '#999' }}>口座が登録されていません</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
