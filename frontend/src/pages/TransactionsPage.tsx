import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import ConfirmDialog from '../components/ConfirmDialog'
import client from '../api/client'
import type { Transaction, Account, Category, TransactionType } from '../types'
import { CATEGORY_LABELS } from '../types'

const TYPE_LABELS: Record<TransactionType, string> = { INCOME: '収入', EXPENSE: '支出' }

export default function TransactionsPage() {
  const navigate = useNavigate()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [filterType, setFilterType] = useState<TransactionType | ''>('')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterCategory, setFilterCategory] = useState<Category | ''>('')
  const [filterMemo, setFilterMemo] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)

  const load = useCallback(() => {
    const params = new URLSearchParams()
    if (filterType) params.set('type', filterType)
    if (filterAccount) params.set('accountId', filterAccount)
    if (filterCategory) params.set('category', filterCategory)
    if (filterMemo) params.set('memo', filterMemo)
    client.get<Transaction[]>(`/transactions?${params}`).then(r => setTransactions(r.data))
  }, [filterType, filterAccount, filterCategory, filterMemo])

  useEffect(() => {
    client.get<Account[]>('/accounts').then(r => setAccounts(r.data))
  }, [])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    if (!deleteTarget) return
    await client.delete(`/transactions/${deleteTarget.id}`)
    setDeleteTarget(null)
    load()
  }

  const filtered = transactions

  return (
    <Layout>
      <h2 style={{ marginBottom: 16, fontSize: 18 }}>取引一覧</h2>

      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title">フィルター</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label className="form-label">収支</label>
            <select className="form-input" value={filterType} onChange={e => setFilterType(e.target.value as TransactionType | '')}>
              <option value="">すべて</option>
              {(Object.keys(TYPE_LABELS) as TransactionType[]).map(k => (
                <option key={k} value={k}>{TYPE_LABELS[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">口座</label>
            <select className="form-input" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
              <option value="">すべて</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">カテゴリ</label>
            <select className="form-input" value={filterCategory} onChange={e => setFilterCategory(e.target.value as Category | '')}>
              <option value="">すべて</option>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map(k => (
                <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">備考キーワード</label>
            <input
              className="form-input"
              placeholder="🔍"
              value={filterMemo}
              onChange={e => setFilterMemo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: 'var(--color-text-sub)', marginBottom: 8 }}>全 {filtered.length} 件</p>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <p style={{ padding: 24, textAlign: 'center', color: 'var(--color-text-sub)' }}>取引がありません</p>
        ) : (
          filtered.map((t, i) => (
            <div key={t.id} style={{
              padding: '12px 16px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border)' : 'none',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>{t.date}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)', margin: '0 6px' }}>·</span>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{CATEGORY_LABELS[t.category]}</span>
                  {t.isSplit && (
                    <span style={{
                      fontSize: 10, padding: '2px 6px',
                      background: '#e3f2fd', color: '#1565c0',
                      borderRadius: 4, marginLeft: 6, fontWeight: 600,
                    }}>割り勘</span>
                  )}
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)', margin: '0 6px' }}>·</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                    {t.isSplit ? t.groupName : t.accountName}
                  </span>
                </div>
                <span style={{
                  fontWeight: 700, fontSize: 15,
                  color: t.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)',
                }}>
                  {t.type === 'INCOME' ? '+' : '-'}¥{t.amount.toLocaleString()}
                </span>
              </div>
              {t.memo && <p style={{ fontSize: 12, color: 'var(--color-text-sub)', marginTop: 4 }}>{t.memo}</p>}
              {!t.isSplit && (
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 6 }}>
                  <button
                    className="btn-outline btn-sm"
                    onClick={() => navigate(`/transactions/${t.id}/edit`)}
                  >
                    編集
                  </button>
                  <button
                    className="btn-sm"
                    style={{ background: '#ffebee', color: 'var(--color-expense)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '5px 12px', fontSize: 12 }}
                    onClick={() => setDeleteTarget(t)}
                  >
                    削除
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="この取引を削除しますか？"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      >
        {deleteTarget && (
          <>
            {deleteTarget.date} {CATEGORY_LABELS[deleteTarget.category]}<br />
            <strong style={{ color: deleteTarget.type === 'INCOME' ? 'var(--color-income)' : 'var(--color-expense)' }}>
              {deleteTarget.type === 'INCOME' ? '+' : '-'}¥{deleteTarget.amount.toLocaleString()}
            </strong>
            {deleteTarget.memo && <><br />{deleteTarget.memo}</>}
          </>
        )}
      </ConfirmDialog>
    </Layout>
  )
}
