import type { ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  children?: ReactNode
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
  danger?: boolean
}

export default function ConfirmDialog({
  open, title, children, onConfirm, onCancel,
  confirmLabel = '削除する', danger = true,
}: Props) {
  if (!open) return null

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-box" onClick={e => e.stopPropagation()}>
        <div className="dialog-title">{title}</div>
        {children && <div className="dialog-body">{children}</div>}
        <div className="dialog-actions">
          <button className="btn-outline" onClick={onCancel}>キャンセル</button>
          <button
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
