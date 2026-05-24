import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import client from '../api/client'
import type { Account, CalendarData } from '../types'

const DAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function TopPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [calendar, setCalendar] = useState<CalendarData | null>(null)
  const [totalBalance, setTotalBalance] = useState(0)

  useEffect(() => {
    client.get<CalendarData>(`/calendar?year=${year}&month=${month}`).then(r => setCalendar(r.data))
    client.get<Account[]>('/accounts').then(r => setTotalBalance(r.data.reduce((s, a) => s + a.balance, 0)))
  }, [year, month])

  const prev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1) }
  const next = () => { if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1) }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <span style={{ fontWeight: 'bold' }}>{user?.displayName}</span>
          <span style={{ color: '#666', marginLeft: 8 }}>(@{user?.username})</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => navigate('/search')} style={{ padding: '4px 12px' }}>カテゴリー検索</button>
          <button onClick={() => navigate('/accounts')} style={{ padding: '4px 12px' }}>口座管理</button>
          <button onClick={async () => { await logout(); navigate('/login') }} style={{ padding: '4px 12px' }}>ログアウト</button>
        </div>
      </div>

      <div style={{ background: '#1976d2', color: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 14 }}>総残高</div>
        <div style={{ fontSize: 28, fontWeight: 'bold' }}>¥{totalBalance.toLocaleString()}</div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={prev} style={{ padding: '4px 12px' }}>◀</button>
        <h2 style={{ margin: 0 }}>{year}年{month}月</h2>
        <button onClick={next} style={{ padding: '4px 12px' }}>▶</button>
      </div>

      {calendar && (
        <div style={{ marginBottom: 12, display: 'flex', gap: 16, justifyContent: 'center', fontSize: 14 }}>
          <span style={{ color: '#1976d2' }}>収入: ¥{calendar.monthIncome.toLocaleString()}</span>
          <span style={{ color: '#d32f2f' }}>支出: ¥{calendar.monthExpense.toLocaleString()}</span>
          <span style={{ color: calendar.monthBalance >= 0 ? '#388e3c' : '#d32f2f' }}>収支: ¥{calendar.monthBalance.toLocaleString()}</span>
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {DAYS.map((d, i) => (
              <th key={d} style={{ padding: 4, textAlign: 'center', color: i === 0 ? '#d32f2f' : i === 6 ? '#1976d2' : '#333', fontSize: 12 }}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendar && chunk(calendar.days, 7).map((week, wi) => (
            <tr key={wi}>
              {week.map((day, di) => (
                <td key={di} onClick={() => day && navigate(`/transactions?date=${day.date}`)}
                  style={{
                    border: '1px solid #eee', padding: 4, verticalAlign: 'top', minHeight: 60,
                    cursor: day ? 'pointer' : 'default',
                    background: day ? '#fff' : '#f5f5f5',
                    color: di === 0 ? '#d32f2f' : di === 6 ? '#1976d2' : '#333',
                  }}>
                  {day && (
                    <>
                      <div style={{ fontSize: 13, fontWeight: 'bold' }}>{day.day}</div>
                      {day.income > 0 && <div style={{ fontSize: 10, color: '#1976d2' }}>+{day.income.toLocaleString()}</div>}
                      {day.expense > 0 && <div style={{ fontSize: 10, color: '#d32f2f' }}>-{day.expense.toLocaleString()}</div>}
                    </>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}
