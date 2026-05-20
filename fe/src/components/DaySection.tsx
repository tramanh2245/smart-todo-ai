import { useState, useCallback } from 'react'
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

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const d = new Date(dateStr + 'T00:00:00')
  const weekdays = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']
  const dow = weekdays[d.getDay()]
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()

  if (dateStr === today) return `Hôm nay · ${dow}, ${dd}/${mm}`
  if (dateStr === yesterday) return `Hôm qua · ${dow}, ${dd}/${mm}`
  return `${dow}, ${dd}/${mm}/${yyyy}`
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10)
}

export function DaySection({ date, tasks, initialNote, onComplete, onDelete }: Props) {
  const [note, setNote] = useState(initialNote)
  const [saving, setSaving] = useState(false)

  const saveNote = useCallback(async (value: string) => {
    setSaving(true)
    try {
      await api.saveDayNote(date, value)
    } finally {
      setSaving(false)
    }
  }, [date])

  let saveTimer: ReturnType<typeof setTimeout>
  const handleNoteChange = (value: string) => {
    setNote(value)
    clearTimeout(saveTimer)
    saveTimer = setTimeout(() => saveNote(value), 800)
  }

  const pending = tasks.filter(t => !t.completed)
  const done = tasks.filter(t => t.completed)

  return (
    <div className={`day-section ${isToday(date) ? 'day-today' : ''}`}>
      <div className="day-header">
        <span className="day-label">{formatDateLabel(date)}</span>
        <span className="day-count">{pending.length > 0 ? `${pending.length} việc` : done.length > 0 ? 'Xong hết' : ''}</span>
      </div>

      {tasks.length === 0 && (
        <p className="day-empty">Không có task nào</p>
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
          placeholder="✏️  Ghi chú cho ngày này..."
          value={note}
          onChange={e => handleNoteChange(e.target.value)}
          rows={2}
        />
        {saving && <span className="day-note-saving">Đang lưu...</span>}
      </div>
    </div>
  )
}
