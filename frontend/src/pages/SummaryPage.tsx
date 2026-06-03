import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import PieChart from '../components/PieChart'
import type { PieSlice } from '../components/PieChart'
import client from '../api/client'
import type { Account, CalendarData, Transaction } from '../types'
import { CATEGORY_LABELS } from '../types'
import { CATEGORY_COLORS } from '../constants'

export default function SummaryPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [calendar, setCalendar] = useState<CalendarData | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    Promise.all([
      client.get<CalendarData>(`/calendar?year=${year}&month=${month}`),
      client.get<Account[]>('/accounts'),
      client.get<Transaction[]>(`/transactions?year=${year}&month=${month}`),
    ]).then(([cal, acc, txn]) => {
      setCalendar(cal.data)
      setAccounts(acc.data)
      setTransactions(txn.data)
    }).catch(() => {
      client.get<CalendarData>(`/calendar?year=${year}&month=${month}`).then(r => setCalendar(r.data))
      client.get<Account[]>('/accounts').then(r => setAccounts(r.data))
    })
  }, [year, month])

  const prev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1) }
  const next = () => { if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1) }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  const expenseByCategory: Record<string, number> = {}
  const incomeByCategory: Record<string, number> = {}
  transactions.forEach(t => {
    if (t.type === 'EXPENSE') {
      expenseByCategory[t.category] = (expenseByCategory[t.category] ?? 0) + t.amount
    } else {
      incomeByCategory[t.category] = (incomeByCategory[t.category] ?? 0) + t.amount
    }
  })

  const expenseSlices: PieSlice[] = Object.entries(expenseByCategory).map(([k, v]) => ({
    label: CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS] ?? k,
    value: v,
    color: CATEGORY_COLORS[k as keyof typeof CATEGORY_COLORS] ?? '#90a4ae',
  }))

  const balance = calendar?.monthBalance ?? 0

  return (
    <Layout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <button className="btn-outline btn-sm" onClick={prev}>◀</button>
        <h2 style={{ fontSize: 18 }}>{year}年{month}月</h2>
        <button className="btn-outline btn-sm" onClick={next}>▶</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
        <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 4 }}>収入合計</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-income)' }}>
            ¥{(calendar?.monthIncome ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 4 }}>支出合計</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-expense)' }}>
            ¥{(calendar?.monthExpense ?? 0).toLocaleString()}
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 4 }}>収支</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: balance >= 0 ? 'var(--color-positive)' : 'var(--color-expense)' }}>
            {balance >= 0 ? '+' : ''}¥{balance.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <p className="section-title">支出内訳</p>
        {expenseSlices.length > 0 ? (
          <PieChart slices={expenseSlices} size={200} />
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--color-text-sub)', padding: 16 }}>支出データなし</p>
        )}
      </div>

      {Object.keys(incomeByCategory).length > 0 && (
        <div className="card" style={{ marginBottom: 20 }}>
          <p className="section-title">収入内訳</p>
          {Object.entries(incomeByCategory).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-border)', fontSize: 14 }}>
              <span>{CATEGORY_LABELS[k as keyof typeof CATEGORY_LABELS] ?? k}</span>
              <span style={{ fontWeight: 600, color: 'var(--color-income)' }}>¥{v.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <p className="section-title">口座別残高</p>
        {accounts.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--color-text-sub)', padding: 8 }}>口座が登録されていません</p>
        ) : (
          <>
            {accounts.map(a => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)', fontSize: 14 }}>
                <span>{a.name}</span>
                <span style={{ fontWeight: 600, color: a.balance >= 0 ? 'var(--color-text)' : 'var(--color-expense)' }}>
                  ¥{a.balance.toLocaleString()}
                </span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 14, fontWeight: 700 }}>
              <span>合計</span>
              <span style={{ color: totalBalance >= 0 ? 'var(--color-positive)' : 'var(--color-expense)' }}>
                ¥{totalBalance.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}
