export type PieSlice = { label: string; value: number; color: string }

type Props = { slices: PieSlice[]; size?: number }

export default function PieChart({ slices, size = 180 }: Props) {
  const total = slices.reduce((s, sl) => s + sl.value, 0)
  if (total === 0) return <p style={{ textAlign: 'center', color: 'var(--color-text-sub)' }}>データなし</p>

  const r = size / 2
  const cx = r
  const cy = r
  const radius = r - 10

  let cumAngle = -Math.PI / 2
  const paths = slices.map(sl => {
    const angle = (sl.value / total) * 2 * Math.PI
    const x1 = cx + radius * Math.cos(cumAngle)
    const y1 = cy + radius * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = cx + radius * Math.cos(cumAngle)
    const y2 = cy + radius * Math.sin(cumAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`
    return { d, color: sl.color }
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths.map((p, i) => (
          <path key={i} d={p.d} fill={p.color} stroke="#fff" strokeWidth={1.5} />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
        {slices.map((sl, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 12, height: 12, borderRadius: 3, background: sl.color, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{sl.label}</span>
            <span style={{ color: 'var(--color-text-sub)' }}>{Math.round(sl.value / total * 100)}%</span>
            <span style={{ fontWeight: 600 }}>¥{sl.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
