import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import client from '../api/client'
import type { Transaction, Account, Category, TransactionType } from '../types'
import { CATEGORY_LABELS } from '../types'

const TYPE_LABELS: Record<TransactionType, string> = { INCOME: '収入', EXPENSE: '支出' }

export default function TransactionsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const dateParam = params.get('date') ?? new Date().toISOString().slice(0, 10)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({
    date: dateParam, accountId: '', amount: '', category: 'FOOD' as Category,
    type: 'EXPENSE' as TransactionType, memo: '',
  })
  const [error, setError] = useState('')

  const load = useCallback(() => {
    client.get<Transaction[]>(`/transactions?date=${dateParam}`).then(r => setTransactions(r.data))
  }, [dateParam])

  useEffect(() => {
    load()
    client.get<Account[]>('/accounts').then(r => {
      setAccounts(r.data)
      if (r.data.length > 0) setForm(f => ({ ...f, accountId: String(r.data[0].id) }))
    })
  }, [load])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const payload = { ...form, accountId: Number(form.accountId), amount: Number(form.amount) }
      if (editId !== null) {
        await client.put(`/transactions/${editId}`, payload)
        setEditId(null)
      } else {
        await client.post('/transactions', payload)
      }
      setForm(f => ({ ...f, amount: '', memo: '' }))
      load()
    } catch (err) {
      const msg = err instanceof Error ? err.message : '保存に失敗しました'
      setError(msg)
    }
  }

  const handleEdit = (t: Transaction) => {
    setEditId(t.id)
    setForm({ date: t.date, accountId: String(t.accountId), amount: String(t.amount), category: t.category, type: t.type, memo: t.memo })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return
    await client.delete(`/transactions/${id}`)
    load()
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <button onClick={() => navigate('/')}>← カレンダーへ</button>
        <h2 style={{ margin: 0 }}>{dateParam} の取引</h2>
      </div>

      {accounts.length === 0 && (
        <div style={{ background: '#fff3cd', padding: 12, marginBottom: 16, borderRadius: 4 }}>
          口座が登録されていません。<button onClick={() => navigate('/accounts')}>口座を登録する</button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#f5f5f5', padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 12px' }}>{editId !== null ? '取引を編集' : '取引を追加'}</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <label>日付<input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required style={{ display: 'block', width: '100%', padding: 6 }} /></label>
          <label>口座
            <select value={form.accountId} onChange={e => setForm({ ...form, accountId: e.target.value })} required style={{ display: 'block', width: '100%', padding: 6 }}>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </label>
          <label>金額（円）<input type="number" min={1} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required style={{ display: 'block', width: '100%', padding: 6 }} /></label>
          <label>収支タイプ
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as TransactionType })} style={{ display: 'block', width: '100%', padding: 6 }}>
              {(Object.keys(TYPE_LABELS) as TransactionType[]).map(k => <option key={k} value={k}>{TYPE_LABELS[k]}</option>)}
            </select>
          </label>
          <label>カテゴリ
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Category })} style={{ display: 'block', width: '100%', padding: 6 }}>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map(k => <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>)}
            </select>
          </label>
          <label>備考<input value={form.memo} onChange={e => setForm({ ...form, memo: e.target.value })} maxLength={100} style={{ display: 'block', width: '100%', padding: 6 }} /></label>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '6px 16px', background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>
            {editId !== null ? '更新' : '追加'}
          </button>
          {editId !== null && <button type="button" onClick={() => { setEditId(null); setForm(f => ({ ...f, amount: '', memo: '' })) }} style={{ padding: '6px 16px' }}>キャンセル</button>}
        </div>
      </form>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: '#f5f5f5' }}>
            <th style={{ padding: 8, textAlign: 'left' }}>日付</th>
            <th style={{ padding: 8, textAlign: 'left' }}>口座</th>
            <th style={{ padding: 8, textAlign: 'left' }}>カテゴリ</th>
            <th style={{ padding: 8, textAlign: 'right' }}>金額</th>
            <th style={{ padding: 8, textAlign: 'left' }}>備考</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(t => (
            <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: 8 }}>{t.date}</td>
              <td style={{ padding: 8 }}>{t.accountName}</td>
              <td style={{ padding: 8 }}>{CATEGORY_LABELS[t.category]}</td>
              <td style={{ padding: 8, textAlign: 'right', color: t.type === 'INCOME' ? '#1976d2' : '#d32f2f' }}>
                {t.type === 'INCOME' ? '+' : '-'}¥{t.amount.toLocaleString()}
              </td>
              <td style={{ padding: 8 }}>{t.memo}</td>
              <td style={{ padding: 8, display: 'flex', gap: 4 }}>
                <button onClick={() => handleEdit(t)} style={{ fontSize: 12 }}>編集</button>
                <button onClick={() => handleDelete(t.id)} style={{ fontSize: 12, color: '#d32f2f' }}>削除</button>
              </td>
            </tr>
          ))}
          {transactions.length === 0 && <tr><td colSpan={6} style={{ padding: 16, textAlign: 'center', color: '#999' }}>この日の取引はありません</td></tr>}
        </tbody>
      </table>
    </div>
  )
}
