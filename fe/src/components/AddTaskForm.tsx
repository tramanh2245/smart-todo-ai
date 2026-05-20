import { useState } from 'react'
import type { Category } from '../types/task'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'work',     label: '💼 Việc' },
  { value: 'health',   label: '🌿 Sức khoẻ' },
  { value: 'learn',    label: '📖 Học' },
  { value: 'personal', label: '🌸 Cá nhân' },
]

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

interface Props {
  onAdd: (title: string, category: Category, startTime?: string | null, endTime?: string | null, taskDate?: string | null) => Promise<void>
}

export function AddTaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('work')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [taskDate, setTaskDate] = useState(todayStr())
  const [adding, setAdding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    setAdding(true)
    try {
      await onAdd(t, category, startTime || null, endTime || null, taskDate || null)
      setTitle('')
      setStartTime('')
      setEndTime('')
    } finally {
      setAdding(false)
    }
  }

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <div className="add-form-row">
        <select
          className="category-select"
          value={category}
          onChange={e => setCategory(e.target.value as Category)}
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <input
          className="task-input"
          type="text"
          placeholder="Thêm việc cần làm..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={adding}
        />
        <button className="btn-add" type="submit" disabled={adding || !title.trim()}>
          {adding ? '...' : '+ Thêm'}
        </button>
      </div>
      <div className="add-form-meta">
        <span className="meta-icon">📅</span>
        <input
          className="date-input"
          type="date"
          value={taskDate}
          onChange={e => setTaskDate(e.target.value)}
          disabled={adding}
        />
        <span className="meta-icon">⏰</span>
        <input
          className="time-input"
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          disabled={adding}
        />
        <span className="time-sep">→</span>
        <input
          className="time-input"
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
          disabled={adding}
        />
      </div>
    </form>
  )
}
