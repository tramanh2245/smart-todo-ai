import { useState, useRef } from 'react'
import type { Task } from '../types/task'
import { TaskCard } from './TaskCard'
import { api } from '../services/api'

interface Props {
  date: string
  tasks: Task[]
  initialNote: string
  onComplete: (task: Task) => void
  onDelete: (id: number) => void
}

function formatDateLabel(dateStr: string): { main: string; sub: string } {
  const today     = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const dow = weekdays[d.getDay()]
  const dd  = String(d.getDate()).padStart(2, '0')
  const mm  = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()

  if (dateStr === today)     return { main: 'Hôm nay 🌸', sub: `${dow} · ${dd}/${mm}` }
  if (dateStr === yesterday) return { main: 'Hôm qua',    sub: `${dow} · ${dd}/${mm}` }
  return { main: `${dow}`, sub: `${dd}/${mm}/${yyyy}` }
}

export function DaySection({ date, tasks, initialNote, onComplete, onDelete }: Props) {
  const [note, setNote] = useState(initialNote)
  const [saving, setSaving] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const today = new Date().toISOString().slice(0, 10)

  const handleNoteChange = (value: string) => {
    setNote(value)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      setSaving(true)
      try { await api.saveDayNote(date, value) }
      finally { setSaving(false) }
    }, 800)
  }

  const pending = tasks.filter(t => !t.completed)
  const done    = tasks.filter(t => t.completed)
  const label   = formatDateLabel(date)

  return (
    <div className={`day-section ${date === today ? 'day-today' : ''}`}>
      <div className="day-header">
        <div className="day-label-wrap">
          <span className="day-label-main">{label.main}</span>
          <span className="day-label-sub">{label.sub}</span>
        </div>
        {pending.length > 0 && (
          <span className="day-badge">{pending.length} việc</span>
        )}
        {pending.length === 0 && done.length > 0 && (
          <span className="day-badge day-badge-done">✓ Xong</span>
        )}
      </div>

      {tasks.length === 0 && (
        <p className="day-empty">— Chưa có việc gì —</p>
      )}

      {pending.map(t => (
        <TaskCard key={t.id} task={t} onComplete={() => onComplete(t)} onDelete={() => onDelete(t.id)} />
      ))}

      {done.length > 0 && (
        <div className="day-done-group">
          {done.map(t => (
            <TaskCard key={t.id} task={t} onComplete={() => {}} onDelete={() => onDelete(t.id)} />
          ))}
        </div>
      )}

      <div className="day-note-wrap">
        <textarea
          className="day-note"
          placeholder="✍  Ghi lại cảm nhận, suy nghĩ trong ngày..."
          value={note}
          onChange={e => handleNoteChange(e.target.value)}
          rows={2}
        />
        {saving && <span className="day-note-saving">Đang lưu...</span>}
      </div>
    </div>
  )
}
