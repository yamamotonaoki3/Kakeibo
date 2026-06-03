import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

type CategoryItem = { key: string; label: string; isDefault: boolean }

const DEFAULT_EXPENSE: CategoryItem[] = [
  { key: 'FOOD', label: '食費', isDefault: true },
  { key: 'DAILY', label: '日用品', isDefault: true },
  { key: 'TRANSPORT', label: '交通費', isDefault: true },
  { key: 'ENTERTAINMENT', label: '娯楽費', isDefault: true },
  { key: 'MEDICAL', label: '医療費', isDefault: true },
  { key: 'UTILITIES', label: '光熱費', isDefault: true },
  { key: 'RENT', label: '家賃', isDefault: true },
  { key: 'COMMUNICATION', label: '通信費', isDefault: true },
  { key: 'INSURANCE', label: '保険料', isDefault: true },
  { key: 'GIFT', label: 'お年玉', isDefault: true },
  { key: 'MOTHERS_DAY', label: '母の日', isDefault: true },
  { key: 'FATHERS_DAY', label: '父の日', isDefault: true },
  { key: 'OTHER_EXPENSE', label: 'その他支出', isDefault: true },
]

const DEFAULT_INCOME: CategoryItem[] = [
  { key: 'SALARY', label: '給料', isDefault: true },
  { key: 'BONUS', label: '賞与', isDefault: true },
  { key: 'SIDE_INCOME', label: '副収入', isDefault: true },
  { key: 'OTHER_INCOME', label: 'その他収入', isDefault: true },
]

export default function CategoriesPage() {
  const navigate = useNavigate()

  return (
    <Layout>
      <h2 style={{ marginBottom: 4, fontSize: 18 }}>カテゴリ管理</h2>
      <p style={{ color: 'var(--color-text-sub)', fontSize: 13, marginBottom: 20 }}>
        <button className="btn-outline btn-sm" onClick={() => navigate('/accounts')}>← 口座管理へ</button>
      </p>

      <div className="card" style={{ marginBottom: 16 }}>
        <p className="section-title">カテゴリを追加</p>
        <div className="form-group">
          <label className="form-label">カテゴリ名 *</label>
          <input className="form-input" placeholder="例：習い事" disabled />
        </div>
        <div className="form-group">
          <label className="form-label">種別 *</label>
          <div className="toggle-group">
            <button type="button" className="toggle-btn active-expense" disabled>● 支出</button>
            <button type="button" className="toggle-btn" disabled>収入</button>
          </div>
        </div>
        <div className="warning-banner" style={{ marginBottom: 12 }}>
          ⚠ カスタムカテゴリ機能は準備中です
        </div>
        <button className="btn-primary" style={{ width: '100%' }} disabled>追加する</button>
      </div>

      <p className="section-title">支出カテゴリ</p>
      <div className="card" style={{ marginBottom: 16, padding: 0, overflow: 'hidden' }}>
        {DEFAULT_EXPENSE.map((cat, i) => (
          <div key={cat.key} style={{
            display: 'flex', alignItems: 'center', padding: '12px 16px',
            borderBottom: i < DEFAULT_EXPENSE.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}>
            <span style={{ flex: 1 }}>{cat.label}</span>
            <span style={{
              fontSize: 11, color: 'var(--color-text-sub)',
              border: '1px solid var(--color-border)',
              borderRadius: 4, padding: '2px 6px',
            }}>デフォルト</span>
          </div>
        ))}
      </div>

      <p className="section-title">収入カテゴリ</p>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {DEFAULT_INCOME.map((cat, i) => (
          <div key={cat.key} style={{
            display: 'flex', alignItems: 'center', padding: '12px 16px',
            borderBottom: i < DEFAULT_INCOME.length - 1 ? '1px solid var(--color-border)' : 'none',
          }}>
            <span style={{ flex: 1 }}>{cat.label}</span>
            <span style={{
              fontSize: 11, color: 'var(--color-text-sub)',
              border: '1px solid var(--color-border)',
              borderRadius: 4, padding: '2px 6px',
            }}>デフォルト</span>
          </div>
        ))}
      </div>
    </Layout>
  )
}
