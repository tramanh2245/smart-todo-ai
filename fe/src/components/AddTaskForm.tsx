import { useState } from 'react'
import type { Category } from '../types/task'

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'work', label: 'Công việc' },
  { value: 'health', label: 'Sức khoẻ' },
  { value: 'learn', label: 'Học tập' },
  { value: 'personal', label: 'Cá nhân' },
]

interface Props {
  onAdd: (title: string, category: Category, startTime?: string | null, endTime?: string | null) => Promise<void>
}

export function AddTaskForm({ onAdd }: Props) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<Category>('work')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [adding, setAdding] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    setAdding(true)
    try {
      await onAdd(t, category, startTime || null, endTime || null)
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
          placeholder="Thêm task mới..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={adding}
        />
        <button className="btn-add" type="submit" disabled={adding || !title.trim()}>
          {adding ? '...' : 'Thêm'}
        </button>
      </div>
      <div className="add-form-time">
        <label className="time-label">Từ</label>
        <input
          className="time-input"
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
          disabled={adding}
        />
        <label className="time-label">đến</label>
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
