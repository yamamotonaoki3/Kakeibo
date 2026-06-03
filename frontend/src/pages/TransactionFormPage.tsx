import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import Layout from '../components/Layout'
import client from '../api/client'
import type { Account, Category, Transaction, TransactionType } from '../types'
import { CATEGORY_LABELS } from '../types'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants'

type FormState = {
  date: string
  type: TransactionType
  category: Category
  amount: string
  accountId: string
  memo: string
}

const today = new Date().toISOString().slice(0, 10)

export default function TransactionFormPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const isEdit = id !== undefined

  const [form, setForm] = useState<FormState>({
    date: searchParams.get('date') ?? today,
    type: 'EXPENSE',
    category: 'FOOD',
    amount: '',
    accountId: '',
    memo: '',
  })
  const [accounts, setAccounts] = useState<Account[]>([])
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    client.get<Account[]>('/accounts').then(r => {
      setAccounts(r.data)
      if (!isEdit && r.data.length > 0) {
        setForm(f => ({ ...f, accountId: String(r.data[0].id) }))
      }
    })
    if (isEdit) {
      client.get<Transaction>(`/transactions/${id}`).then(r => {
        const t = r.data
        setForm({
          date: t.date,
          type: t.type,
          category: t.category,
          amount: String(t.amount),
          accountId: String(t.accountId),
          memo: t.memo ?? '',
        })
      })
    }
  }, [id, isEdit])

  const categories = form.type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  const setType = (type: TransactionType) => {
    const cats = type === 'EXPENSE' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES
    setForm(f => ({ ...f, type, category: cats[0] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const amount = Number(form.amount)
    if (!amount || amount < 1) { setError('1円以上の整数を入力してください'); return }
    try {
      const payload = { ...form, amount, accountId: Number(form.accountId) }
      if (isEdit) {
        await client.put(`/transactions/${id}`, payload)
        navigate('/transactions')
      } else {
        await client.post('/transactions', payload)
        setForm(f => ({ ...f, amount: '', memo: '' }))
        showToast('登録しました！')
      }
    } catch {
      setError('保存に失敗しました')
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  return (
    <Layout>
      <h2 style={{ marginBottom: 20, fontSize: 18 }}>
        {isEdit ? (
          <>
            <button className="btn-outline btn-sm" onClick={() => navigate('/transactions')} style={{ marginRight: 12 }}>
              ← 一覧に戻る
            </button>
            取引を編集
          </>
        ) : '取引を追加'}
      </h2>

      {accounts.length === 0 && (
        <div className="warning-banner" style={{ marginBottom: 16 }}>
          ⚠ 口座が登録されていません。
          <button onClick={() => navigate('/accounts')}>口座管理へ</button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: 480 }}>
        <div className="form-group">
          <label className="form-label">日付 *</label>
          <input
            type="date"
            className="form-input"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">収支タイプ *</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${form.type === 'EXPENSE' ? 'active-expense' : ''}`}
              onClick={() => setType('EXPENSE')}
            >
              {form.type === 'EXPENSE' ? '● ' : ''}支出
            </button>
            <button
              type="button"
              className={`toggle-btn ${form.type === 'INCOME' ? 'active-income' : ''}`}
              onClick={() => setType('INCOME')}
            >
              {form.type === 'INCOME' ? '● ' : ''}収入
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">カテゴリ *</label>
          <select
            className="form-input"
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value as Category })}
          >
            {categories.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">金額 *</label>
          <input
            type="number"
            min={1}
            className="form-input"
            placeholder="¥ 0"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
            required
          />
          {error && <p className="form-error">{error}</p>}
        </div>

        <div className="form-group">
          <label className="form-label">口座 *</label>
          <select
            className="form-input"
            value={form.accountId}
            onChange={e => setForm({ ...form, accountId: e.target.value })}
            required
          >
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">備考（任意・100文字以内）</label>
          <input
            className="form-input"
            value={form.memo}
            onChange={e => setForm({ ...form, memo: e.target.value })}
            maxLength={100}
            placeholder="例：スーパーで購入"
          />
        </div>

        {isEdit ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-outline" onClick={() => navigate('/transactions')}>
              キャンセル
            </button>
            <button type="submit" className="btn-primary" style={{ flex: 1 }}>
              保存する
            </button>
          </div>
        ) : (
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            登録する
          </button>
        )}
      </form>

      {toast && <div className="toast">✅ {toast}</div>}
    </Layout>
  )
}
