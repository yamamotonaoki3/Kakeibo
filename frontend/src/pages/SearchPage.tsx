import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import client from '../api/client'
import type { Category, Transaction } from '../types'
import { CATEGORY_LABELS } from '../types'

const CATEGORIES = Object.keys(CATEGORY_LABELS) as Category[]

export default function SearchPage() {
  const navigate = useNavigate()
  const [category, setCategory] = useState<Category>('FOOD')
  const [results, setResults] = useState<Transaction[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await client.get<Transaction[]>('/transactions', { params: { category } })
      setResults(res.data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate('/')} style={{ padding: '4px 12px' }}>← 戻る</button>
        <h2 style={{ margin: 0 }}>カテゴリー検索</h2>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24 }}>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as Category)}
          style={{ padding: '8px 12px', fontSize: 14, borderRadius: 4, border: '1px solid #ccc' }}
        >
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>
        <button
          type="submit"
          style={{ padding: '8px 20px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}
        >
          検索
        </button>
      </form>

      {loading && <p style={{ color: '#666' }}>検索中...</p>}

      {results !== null && !loading && (
        results.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', marginTop: 40 }}>該当する取引がありません</p>
        ) : (
          <>
            <p style={{ color: '#666', marginBottom: 8 }}>{results.length} 件見つかりました</p>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={th}>日付</th>
                  <th style={th}>口座</th>
                  <th style={th}>カテゴリー</th>
                  <th style={th}>種別</th>
                  <th style={th}>金額</th>
                  <th style={th}>メモ</th>
                </tr>
              </thead>
              <tbody>
                {results.map(t => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={td}>{t.date}</td>
                    <td style={td}>{t.accountName}</td>
                    <td style={td}>{CATEGORY_LABELS[t.category]}</td>
                    <td style={{ ...td, color: t.type === 'INCOME' ? '#1976d2' : '#d32f2f' }}>
                      {t.type === 'INCOME' ? '収入' : '支出'}
                    </td>
                    <td style={{ ...td, textAlign: 'right' }}>¥{t.amount.toLocaleString()}</td>
                    <td style={td}>{t.memo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )
      )}
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontWeight: 'bold', fontSize: 13 }
const td: React.CSSProperties = { padding: '8px 12px', fontSize: 13 }
