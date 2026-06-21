import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { getGroups, getGroupMembers, createSplit } from '../api/groupApi'
import type { Group, GroupMember } from '../types'

export default function SplitFormPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [members, setMembers] = useState<GroupMember[]>([])
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<number>>(new Set())
  const [ratios, setRatios] = useState<Record<number, string>>({})
  const [totalAmount, setTotalAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [splitDate, setSplitDate] = useState(new Date().toISOString().split('T')[0])
  const [error, setError] = useState('')

  useEffect(() => {
    getGroups().then(r => setGroups(r.data))
  }, [])

  useEffect(() => {
    if (!selectedGroupId) { setMembers([]); setSelectedMemberIds(new Set()); setRatios({}); return }
    getGroupMembers(Number(selectedGroupId)).then(r => {
      setMembers(r.data)
      const ids = new Set(r.data.map(m => m.userId))
      setSelectedMemberIds(ids)
      distributeEvenly(r.data.map(m => m.userId))
    })
  }, [selectedGroupId])

  const distributeEvenly = (ids: number[]) => {
    if (ids.length === 0) return
    const base = Math.floor(100 / ids.length)
    const remainder = 100 - base * ids.length
    const newRatios: Record<number, string> = {}
    ids.forEach((id, i) => {
      newRatios[id] = String(i === 0 ? base + remainder : base)
    })
    setRatios(newRatios)
  }

  const toggleMember = (userId: number) => {
    const next = new Set(selectedMemberIds)
    if (next.has(userId)) {
      next.delete(userId)
    } else {
      next.add(userId)
    }
    setSelectedMemberIds(next)
    distributeEvenly(Array.from(next))
  }

  const totalRatio = Array.from(selectedMemberIds)
    .reduce((sum, id) => sum + Number(ratios[id] ?? 0), 0)

  const previewAmount = (userId: number): number => {
    if (!totalAmount || !ratios[userId]) return 0
    return Math.floor(Number(totalAmount) * Number(ratios[userId]) / 100)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedMemberIds.size === 0) { setError('参加メンバーを1人以上選択してください'); return }
    if (Math.abs(totalRatio - 100) > 0.01) { setError(`比率の合計が100%になるようにしてください（現在: ${totalRatio}%）`); return }

    try {
      await createSplit({
        groupId: Number(selectedGroupId),
        totalAmount: Number(totalAmount),
        memo,
        splitDate,
        shares: Array.from(selectedMemberIds).map(id => ({
          userId: id,
          shareRatio: Number(ratios[id] ?? 0),
        })),
      })
      navigate('/splits')
    } catch (err: any) {
      setError(err.response?.data?.message ?? '登録に失敗しました')
    }
  }

  return (
    <Layout>
      <h2 style={{ marginBottom: 16, fontSize: 18 }}>割り勘を登録</h2>

      {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 12 }}>
          <div className="form-group">
            <label className="form-label">グループ *</label>
            <select
              className="form-input"
              value={selectedGroupId}
              onChange={e => setSelectedGroupId(e.target.value)}
              required
            >
              <option value="">グループを選択</option>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">日付 *</label>
            <input
              type="date"
              className="form-input"
              value={splitDate}
              onChange={e => setSplitDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">合計金額（円）*</label>
            <input
              type="number"
              className="form-input"
              placeholder="例：6000"
              value={totalAmount}
              onChange={e => setTotalAmount(e.target.value)}
              min={1}
              required
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">メモ</label>
            <input
              className="form-input"
              placeholder="例：居酒屋代"
              value={memo}
              onChange={e => setMemo(e.target.value)}
            />
          </div>
        </div>

        {members.length > 0 && (
          <div className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <p className="section-title" style={{ margin: 0 }}>メンバーと比率</p>
              <button
                type="button"
                className="btn-outline btn-sm"
                onClick={() => distributeEvenly(Array.from(selectedMemberIds))}
              >
                等分
              </button>
            </div>

            {members.map(m => (
              <div key={m.userId} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 0', borderBottom: '1px solid var(--color-border)'
              }}>
                <input
                  type="checkbox"
                  checked={selectedMemberIds.has(m.userId)}
                  onChange={() => toggleMember(m.userId)}
                  style={{ width: 18, height: 18, flexShrink: 0 }}
                />
                <span style={{ flex: 1, fontSize: 14 }}>{m.displayName}</span>
                {selectedMemberIds.has(m.userId) && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type="number"
                        value={ratios[m.userId] ?? ''}
                        onChange={e => setRatios(prev => ({ ...prev, [m.userId]: e.target.value }))}
                        min={0}
                        max={100}
                        style={{
                          width: 64, textAlign: 'right', padding: '4px 8px',
                          border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)',
                          fontSize: 14
                        }}
                      />
                      <span style={{ fontSize: 14 }}>%</span>
                    </div>
                    {totalAmount && (
                      <span style={{ fontSize: 13, color: 'var(--color-text-sub)', minWidth: 64, textAlign: 'right' }}>
                        ¥{previewAmount(m.userId).toLocaleString()}
                      </span>
                    )}
                  </>
                )}
              </div>
            ))}

            <div style={{
              marginTop: 10, padding: '8px 12px',
              background: Math.abs(totalRatio - 100) < 0.01 ? '#e8f5e9' : '#fff3e0',
              borderRadius: 'var(--radius-sm)', textAlign: 'right', fontSize: 14
            }}>
              合計: <strong>{totalRatio}%</strong>
              {Math.abs(totalRatio - 100) >= 0.01 && (
                <span style={{ color: 'var(--color-expense)', marginLeft: 8, fontSize: 12 }}>
                  （100%になるよう調整してください）
                </span>
              )}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="btn-primary"
          style={{ width: '100%' }}
          disabled={!selectedGroupId || selectedMemberIds.size === 0}
        >
          登録する
        </button>
      </form>
    </Layout>
  )
}
