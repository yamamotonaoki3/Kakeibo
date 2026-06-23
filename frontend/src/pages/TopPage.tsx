import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import client from '../api/client'
import type { Account, CalendarData, Transaction } from '../types'
import styles from './TopPage.module.css'

function getSeasonalEvents(year: number, month: number): Record<number, string> {
  const events: Record<number, string> = {}
  if (month === 1) events[1] = '🎍お年玉'
  if (month === 5) {
    const may1 = new Date(year, 4, 1).getDay()
    const secondSunday = 1 + (7 - may1) % 7 + 7
    events[secondSunday] = '🌸母の日'
  }
  if (month === 6) {
    const jun1 = new Date(year, 5, 1).getDay()
    const thirdSunday = 1 + (7 - jun1) % 7 + 14
    events[thirdSunday] = '👔父の日'
  }
  return events
}

type SeasonalSpend = { label: string; amount: number | null }

const SEASONAL_CATEGORIES = [
  { label: '🎍お年玉', category: 'GIFT' },
  { label: '🌸母の日', category: 'MOTHERS_DAY' },
  { label: '👔父の日', category: 'FATHERS_DAY' },
] as const

function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

const DAYS = ['月', '火', '水', '木', '金', '土', '日']

export default function TopPage() {
  const navigate = useNavigate()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [calendar, setCalendar] = useState<CalendarData | null>(null)
  const [totalBalance, setTotalBalance] = useState(0)
  const [seasonalSpends, setSeasonalSpends] = useState<SeasonalSpend[]>([])

  useEffect(() => {
    client.get<CalendarData>(`/calendar?year=${year}&month=${month}`).then(r => setCalendar(r.data))
    client.get<Account[]>('/accounts').then(r => setTotalBalance(r.data.reduce((s, a) => s + a.balance, 0)))
  }, [year, month])

  useEffect(() => {
    Promise.all(
      SEASONAL_CATEGORIES.map(({ label, category }) =>
        client.get<Transaction[]>(`/transactions?category=${category}`)
          .then(r => {
            const yearTxns = r.data.filter(t => t.date.startsWith(String(year)))
            const total = yearTxns.reduce((s, t) => s + t.amount, 0)
            return { label, amount: yearTxns.length > 0 ? total : null }
          })
      )
    ).then(setSeasonalSpends).catch(() => setSeasonalSpends([]))
  }, [year])

  const prev = () => { if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1) }
  const next = () => { if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1) }

  const seasonalEvents = getSeasonalEvents(year, month)

  const handleDayClick = (date: string, dayNum: number) => {
    const event = seasonalEvents[dayNum]
    if (event) {
      navigate(`/transactions/new?date=${date}`)
    } else {
      navigate(`/transactions/new?date=${date}`)
    }
  }

  return (
    <Layout>
      <div className={styles.balanceCard}>
        <div className={styles.balanceLabel}>💰 総残高</div>
        <div className={styles.balanceAmount}>¥{totalBalance.toLocaleString()}</div>
      </div>

      <div className={styles.monthNav}>
        <div className={styles.monthNavLeft}>
          <button className="btn-outline btn-sm" onClick={prev}>◀</button>
          <h2 className={styles.monthTitle}>{year}年{month}月</h2>
          <button className="btn-outline btn-sm" onClick={next}>▶</button>
        </div>
        {seasonalSpends.length > 0 && (
          <div className={styles.seasonalSummary}>
            {seasonalSpends.map(s => (
              <span key={s.label} className={styles.seasonalItem}>
                {s.label}
                {s.amount !== null
                  ? <strong>¥{s.amount.toLocaleString()}</strong>
                  : <span className={styles.unregistered}>未登録</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {calendar && (
        <div className={styles.monthlySummary}>
          <span className="amount-income">収入 ¥{calendar.monthIncome.toLocaleString()}</span>
          <span className="amount-expense">支出 ¥{calendar.monthExpense.toLocaleString()}</span>
          <span className={calendar.monthBalance >= 0 ? 'amount-positive' : 'amount-expense'}>
            収支 {calendar.monthBalance >= 0 ? '+' : ''}¥{calendar.monthBalance.toLocaleString()}
          </span>
        </div>
      )}

      <div className={styles.calendarWrapper}>
        <table className={styles.calendar}>
          <thead>
            <tr>
              {DAYS.map((d, i) => (
                <th key={d} className={`${styles.dayHeader} ${i === 5 ? styles.sat : ''} ${i === 6 ? styles.sun : ''}`}>
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar && chunk(calendar.days, 7).map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => {
                  const isSat = di === 5
                  const isSun = di === 6
                  const badge = day ? seasonalEvents[day.day] : undefined
                  const balance = day ? day.income - day.expense : 0
                  return (
                    <td
                      key={di}
                      onClick={() => day && handleDayClick(day.date, day.day)}
                      className={`${styles.cell} ${day ? styles.cellActive : styles.cellEmpty} ${isSat ? styles.sat : ''} ${isSun ? styles.sun : ''}`}
                    >
                      {day && (
                        <>
                          <div className={styles.dayNum}>{day.day}</div>
                          {badge && <div className={styles.badge}>{badge}</div>}
                          {day.income > 0 && <div className={`${styles.amt} ${styles.amtIncome}`}>+{day.income.toLocaleString()}</div>}
                          {day.expense > 0 && <div className={`${styles.amt} ${styles.amtExpense}`}>-{day.expense.toLocaleString()}</div>}
                          {(day.income > 0 || day.expense > 0) && (
                            <div className={`${styles.amt} ${styles.amtBalance}`}>
                              {balance >= 0 ? '+' : ''}{balance.toLocaleString()}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  )
}
