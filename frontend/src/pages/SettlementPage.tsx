import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import {
  getSplits, getSplitSummary, settleShare,
  getTransfers, getTransferSummary, settleTransfer
} from '../api/groupApi'
import { useAuth } from '../context/useAuth'
import type { SplitTransaction, Transfer, DebtSummary } from '../types'

type Tab = 'summary' | 'splits' | 'transfers'

function toYM(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function monthRange(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  const from = `${ym}-01`
  const last = new Date(y, m, 0).getDate()
  const to = `${ym}-${String(last).padStart(2, '0')}`
  return { from, to }
}

export default function SettlementPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('summary')
  const [selectedMonth, setSelectedMonth] = useState(toYM(new Date()))
  const [useCustomRange, setUseCustomRange] = useState(false)
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const [splitSummary, setSplitSummary] = useState<DebtSummary[]>([])
  const [transferSummary, setTransferSummary] = useState<DebtSummary[]>([])
  const [splits, setSplits] = useState<SplitTransaction[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [expandedSplitId, setExpandedSplitId] = useState<number | null>(null)

  const getRange = useCallback(() => {
    if (useCustomRange && customFrom && customTo) return { from: customFrom, to: customTo }
    return monthRange(selectedMonth)
  }, [useCustomRange, customFrom, customTo, selectedMonth])

  const load = useCallback(async () => {
    const { from, to } = getRange()
    const [ss, ts, sp, tr] = await Promise.all([
      getSplitSummary(from, to),
      getTransferSummary(from, to),
      getSplits(from, to),
      getTransfers(from, to),
    ])
    setSplitSummary(ss.data)
    setTransferSummary(ts.data)
    setSplits(sp.data)
    setTransfers(tr.data)
  }, [getRange])

  useEffect(() => { load() }, [load])

  const handleSettleShare = async (splitId: number, shareId: number) => {
    await settleShare(splitId, shareId)
    load()
  }

  const handleSettleTransfer = async (transferId: number) => {
    await settleTransfer(transferId)
    load()
  }

  // 割り勘と送金のサマリーを合算
  const allSummary: DebtSummary[] = []
  const summaryMap = new Map<string, DebtSummary>()
  const addToSummary = (items: DebtSummary[]) => {
    for (const d of items) {
      const key = `${d.fromUserId}:${d.toUserId}`
      const revKey = `${d.toUserId}:${d.fromUserId}`
      if (summaryMap.has(revKey)) {
        const rev = summaryMap.get(revKey)!
        if (rev.amount > d.amount) {
          summaryMap.set(revKey, { ...rev, amount: rev.amount - d.amount })
        } else if (rev.amount < d.amount) {
          summaryMap.delete(revKey)
          summaryMap.set(key, { ...d, amount: d.amount - rev.amount })
        } else {
          summaryMap.delete(revKey)
        }
      } else if (summaryMap.has(key)) {
        summaryMap.set(key, { ...d, amount: (summaryMap.get(key)!.amount + d.amount) })
      } else {
        summaryMap.set(key, d)
      }
    }
  }
  addToSummary(splitSummary)
  addToSummary(transferSummary)
  summaryMap.forEach(v => allSummary.push(v))

  return (
    <Layout>
      <h2 style={{ marginBottom: 12, fontSize: 18 }}>割り勘・送金</h2>

      {/* 期間セレクター */}
      <div className="card" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: useCustomRange ? 10 : 0 }}>
          <select
            className="form-input"
            style={{ flex: 1 }}
            value={useCustomRange ? '__custom__' : selectedMonth}
            onChange={e => {
              if (e.target.value === '__custom__') { setUseCustomRange(true) }
              else { setUseCustomRange(false); setSelectedMonth(e.target.value) }
            }}
          >
            {Array.from({ length: 12 }, (_, i) => {
              const d = new Date()
              d.setMonth(d.getMonth() - i)
              const ym = toYM(d)
              return <option key={ym} value={ym}>{ym.replace('-', '年')}月</option>
            })}
            <option value="__custom__">期間を指定</option>
          </select>
        </div>
        {useCustomRange && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="date" className="form-input" style={{ flex: 1 }} value={customFrom} onChange={e => setCustomFrom(e.target.value)} />
            <span>〜</span>
            <input type="date" className="form-input" style={{ flex: 1 }} value={customTo} onChange={e => setCustomTo(e.target.value)} />
          </div>
        )}
      </div>

      {/* タブ */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(['summary', 'splits', 'transfers'] as const).map(t => (
          <button
            key={t}
            className={tab === t ? 'btn-primary' : 'btn-outline'}
            style={{ flex: 1, fontSize: 13 }}
            onClick={() => setTab(t)}
          >
            {t === 'summary' ? 'サマリー' : t === 'splits' ? '割り勘' : '送金'}
          </button>
        ))}
      </div>

      {/* サマリータブ */}
      {tab === 'summary' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <button
              className="btn-primary"
              style={{ flex: 1 }}
              onClick={() => navigate('/splits/new')}
            >
              + 割り勘を登録
            </button>
            <button
              className="btn-outline"
              style={{ flex: 1 }}
              onClick={() => navigate('/transfers/new')}
            >
              + 送金を記録
            </button>
          </div>
          <button
            className="btn-outline"
            style={{ width: '100%', marginBottom: 12 }}
            onClick={() => navigate('/groups')}
          >
            👥 グループ管理
          </button>

          {allSummary.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-sub)' }}>
              <p>未精算の金額はありません</p>
            </div>
          ) : (
            allSummary.map((d, i) => (
              <div key={i} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-expense)' }}>{d.fromDisplayName}</span>
                  <span style={{ fontSize: 18 }}>→</span>
                  <span style={{ fontWeight: 600 }}>{d.toDisplayName}</span>
                  <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: 16, color: 'var(--color-expense)' }}>
                    ¥{d.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* 割り勘履歴タブ */}
      {tab === 'splits' && (
        <>
          <button
            className="btn-primary"
            style={{ width: '100%', marginBottom: 12 }}
            onClick={() => navigate('/splits/new')}
          >
            + 割り勘を登録
          </button>

          {splits.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-sub)' }}>
              <p>この期間の割り勘はありません</p>
            </div>
          ) : (
            splits.map(tx => (
              <div key={tx.id} className="card" style={{ marginBottom: 10 }}>
                <div
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedSplitId(expandedSplitId === tx.id ? null : tx.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 2 }}>
                        {tx.memo || '（メモなし）'}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                        {tx.groupName} · {tx.splitDate} · {tx.paidByDisplayName}が支払い
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>¥{tx.totalAmount.toLocaleString()}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-sub)' }}>
                        {expandedSplitId === tx.id ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>
                </div>

                {expandedSplitId === tx.id && (
                  <div style={{ marginTop: 10, borderTop: '1px solid var(--color-border)', paddingTop: 10 }}>
                    {tx.shares.map(s => (
                      <div key={s.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '6px 0', borderBottom: '1px solid var(--color-border)'
                      }}>
                        <span style={{ flex: 1, fontSize: 14 }}>{s.displayName}</span>
                        <span style={{ fontSize: 13, color: 'var(--color-text-sub)' }}>
                          {s.shareRatio}% · ¥{s.shareAmount.toLocaleString()}
                        </span>
                        {s.isSettled ? (
                          <span style={{ fontSize: 12, color: 'var(--color-positive)', minWidth: 60, textAlign: 'right' }}>
                            ✓ 精算済
                          </span>
                        ) : (
                          s.userId === user?.id && s.userId !== tx.paidByUserId ? (
                            <button
                              className="btn-sm"
                              style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: 12 }}
                              onClick={() => handleSettleShare(tx.id, s.id)}
                            >
                              精算完了
                            </button>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--color-text-sub)', minWidth: 60, textAlign: 'right' }}>
                              未精算
                            </span>
                          )
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* 送金履歴タブ */}
      {tab === 'transfers' && (
        <>
          <button
            className="btn-outline"
            style={{ width: '100%', marginBottom: 12 }}
            onClick={() => navigate('/transfers/new')}
          >
            + 送金を記録
          </button>

          {transfers.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-sub)' }}>
              <p>この期間の送金はありません</p>
            </div>
          ) : (
            transfers.map(t => (
              <div key={t.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 2 }}>
                      {t.fromDisplayName} → {t.toDisplayName}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                      {t.transferDate}{t.memo ? ` · ${t.memo}` : ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>¥{t.amount.toLocaleString()}</div>
                    {t.isSettled ? (
                      <div style={{ fontSize: 12, color: 'var(--color-positive)' }}>✓ 精算済</div>
                    ) : (
                      (t.fromUserId === user?.id || t.toUserId === user?.id) && (
                        <button
                          className="btn-sm"
                          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: 12, marginTop: 4 }}
                          onClick={() => handleSettleTransfer(t.id)}
                        >
                          精算完了
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </Layout>
  )
}
