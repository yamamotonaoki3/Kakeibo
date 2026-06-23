import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { getGroups, createGroup, joinGroup, getGroupMembers } from '../api/groupApi'
import type { Group, GroupMember } from '../types'

type Tab = 'list' | 'create'

export default function GroupPage() {
  const [tab, setTab] = useState<Tab>('list')
  const [groups, setGroups] = useState<Group[]>([])
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [members, setMembers] = useState<Record<number, GroupMember[]>>({})
  const [createName, setCreateName] = useState('')
  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => getGroups().then(r => setGroups(r.data))
  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCreatedCode(null)
    try {
      const r = await createGroup(createName)
      setCreatedCode(r.data.inviteCode)
      setCreateName('')
      load()
    } catch {
      setError('グループの作成に失敗しました')
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      const r = await joinGroup(joinCode.toUpperCase())
      setSuccess(`「${r.data.name}」に参加しました`)
      setJoinCode('')
      load()
    } catch (err: any) {
      setError(err.response?.data?.message ?? '参加に失敗しました。招待コードを確認してください')
    }
  }

  const toggleMembers = async (groupId: number) => {
    if (expandedId === groupId) {
      setExpandedId(null)
      return
    }
    setExpandedId(groupId)
    if (!members[groupId]) {
      const r = await getGroupMembers(groupId)
      setMembers(prev => ({ ...prev, [groupId]: r.data }))
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
  }

  return (
    <Layout>
      <h2 style={{ marginBottom: 16, fontSize: 18 }}>グループ管理</h2>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          className={tab === 'list' ? 'btn-primary' : 'btn-outline'}
          style={{ flex: 1 }}
          onClick={() => { setTab('list'); setError(''); setSuccess('') }}
        >
          グループ一覧
        </button>
        <button
          className={tab === 'create' ? 'btn-primary' : 'btn-outline'}
          style={{ flex: 1 }}
          onClick={() => { setTab('create'); setError(''); setSuccess('') }}
        >
          作成 / 参加
        </button>
      </div>

      {tab === 'list' && (
        <>
          {groups.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--color-text-sub)' }}>
              <p>グループがありません</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>「作成 / 参加」からグループを追加してください</p>
            </div>
          ) : (
            groups.map(g => (
              <div key={g.id} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 4 }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-sub)' }}>
                      作成者: {g.createdByDisplayName}
                    </div>
                  </div>
                  <button className="btn-outline btn-sm" onClick={() => toggleMembers(g.id)}>
                    {expandedId === g.id ? '閉じる' : 'メンバー'}
                  </button>
                </div>

                <div style={{
                  marginTop: 10, padding: '8px 12px',
                  background: 'var(--color-bg)', borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-sub)', marginBottom: 2 }}>招待コード</div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 18, letterSpacing: 2 }}>
                      {g.inviteCode}
                    </div>
                  </div>
                  <button className="btn-outline btn-sm" onClick={() => copyCode(g.inviteCode)}>
                    コピー
                  </button>
                </div>

                {expandedId === g.id && members[g.id] && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ fontSize: 12, color: 'var(--color-text-sub)', marginBottom: 6 }}>メンバー一覧</div>
                    {members[g.id].map(m => (
                      <div key={m.userId} style={{
                        padding: '6px 0', borderBottom: '1px solid var(--color-border)',
                        fontSize: 14, display: 'flex', alignItems: 'center', gap: 8
                      }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: 'var(--color-primary)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 600, flexShrink: 0
                        }}>
                          {m.displayName.charAt(0)}
                        </span>
                        {m.displayName}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {tab === 'create' && (
        <>
          {error && <p className="form-error" style={{ marginBottom: 12 }}>{error}</p>}
          {success && <p style={{ color: 'var(--color-positive)', marginBottom: 12, fontSize: 14 }}>{success}</p>}

          <div className="card" style={{ marginBottom: 16 }}>
            <p className="section-title">グループを作成</p>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">グループ名 *</label>
                <input
                  className="form-input"
                  placeholder="例：山田家"
                  value={createName}
                  onChange={e => setCreateName(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                作成する
              </button>
            </form>
            {createdCode && (
              <div style={{
                marginTop: 16, padding: 16,
                background: '#e8f5e9', borderRadius: 'var(--radius-sm)', textAlign: 'center'
              }}>
                <div style={{ fontSize: 13, marginBottom: 6 }}>グループを作成しました！招待コードを共有してください</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 24, letterSpacing: 4, marginBottom: 8 }}>
                  {createdCode}
                </div>
                <button className="btn-outline btn-sm" onClick={() => copyCode(createdCode)}>
                  コピー
                </button>
              </div>
            )}
          </div>

          <div className="card">
            <p className="section-title">招待コードで参加</p>
            <form onSubmit={handleJoin}>
              <div className="form-group">
                <label className="form-label">招待コード（8文字）*</label>
                <input
                  className="form-input"
                  placeholder="例：AB12CD34"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value)}
                  maxLength={8}
                  style={{ fontFamily: 'monospace', letterSpacing: 2, textTransform: 'uppercase' }}
                  required
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                参加する
              </button>
            </form>
          </div>
        </>
      )}
    </Layout>
  )
}
