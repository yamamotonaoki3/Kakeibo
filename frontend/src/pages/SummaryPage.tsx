import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import type { Account, CalendarData } from '../types'

export default function SummaryPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [calendar, setCalendar] = useState<CalendarData | null>(null)
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    Promise.all([
      client.get<CalendarData>(`/calendar?year=${year}&month=${month}`),
      client.get<Account[]>('/accounts'),
    ]).then(([cal, acc]) => {
      setCalendar(cal.data)
      setAccounts(acc.data)
    })
  }, [year, month])

  const prev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1) }
  const next = () => { if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1) }

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ padding: '4px 12px' }}>← カレンダーへ</button>
        <h2 style={{ margin: 0 }}>月間サマリー</h2>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button onClick={prev} style={{ padding: '4px 12px' }}>◀</button>
        <span style={{ fontSize: 20, fontWeight: 'bold' }}>{year}年{month}月</span>
        <button onClick={next} style={{ padding: '4px 12px' }}>▶</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        <div style={cardStyle('#e3f2fd', '#1976d2')}>
          <div style={{ fontSize: 13, marginBottom: 4 }}>収入合計</div>
          <div style={{ fontSize: 22, fontWeight: 'bold' }}>¥{(calendar?.monthIncome ?? 0).toLocaleString()}</div>
        </div>
        <div style={cardStyle('#ffebee', '#d32f2f')}>
          <div style={{ fontSize: 13, marginBottom: 4 }}>支出合計</div>
          <div style={{ fontSize: 22, fontWeight: 'bold' }}>¥{(calendar?.monthExpense ?? 0).toLocaleString()}</div>
        </div>
        <div style={cardStyle(
          (calendar?.monthBalance ?? 0) >= 0 ? '#e8f5e9' : '#ffebee',
          (calendar?.monthBalance ?? 0) >= 0 ? '#388e3c' : '#d32f2f'
        )}>
          <div style={{ fontSize: 13, marginBottom: 4 }}>収支</div>
          <div style={{ fontSize: 22, fontWeight: 'bold' }}>¥{(calendar?.monthBalance ?? 0).toLocaleString()}</div>
        </div>
      </div>

      <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>口座別残高</h3>
      {accounts.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', marginTop: 24 }}>口座が登録されていません</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f5f5f5' }}>
              <th style={th}>口座名</th>
              <th style={{ ...th, textAlign: 'right' }}>初期残高</th>
              <th style={{ ...th, textAlign: 'right' }}>現在残高</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{a.name}</td>
                <td style={{ ...td, textAlign: 'right' }}>¥{a.initialBalance.toLocaleString()}</td>
                <td style={{ ...td, textAlign: 'right', color: a.balance >= 0 ? '#333' : '#d32f2f', fontWeight: 'bold' }}>
                  ¥{a.balance.toLocaleString()}
                </td>
              </tr>
            ))}
            <tr style={{ background: '#f5f5f5', fontWeight: 'bold' }}>
              <td style={td}>合計</td>
              <td style={{ ...td, textAlign: 'right' }}></td>
              <td style={{ ...td, textAlign: 'right', color: totalBalance >= 0 ? '#388e3c' : '#d32f2f' }}>
                ¥{totalBalance.toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  )
}

function cardStyle(bg: string, color: string): React.CSSProperties {
  return { background: bg, color, padding: 16, borderRadius: 8, textAlign: 'center' }
}

const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', fontSize: 13 }
const td: React.CSSProperties = { padding: '8px 12px', fontSize: 14 }
