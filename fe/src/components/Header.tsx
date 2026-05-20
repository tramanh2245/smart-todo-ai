import type { Task } from '../types/task'

interface Props {
  tasks: Task[]
  suggestLoading: boolean
  onSuggest: () => void
  onRefresh: () => void
}

export function Header({ tasks, suggestLoading, onSuggest, onRefresh }: Props) {
  const pending = tasks.filter(t => !t.completed).length
  const done = tasks.filter(t => t.completed).length

  return (
    <header className="header">
      <div className="header-top">
        <div className="header-title">
          <span className="header-icon">🌸</span>
          <div>
            <h1>Smart To-Do AI</h1>
            <p className="header-sub">Nhật ký & Công việc</p>
          </div>
        </div>
        <div className="header-actions">
          <button
            className="btn-icon"
            onClick={onSuggest}
            disabled={suggestLoading}
            title="AI gợi ý task"
          >
            {suggestLoading ? <span className="spinner-sm" /> : '✨'}
          </button>
          <button className="btn-icon" onClick={onRefresh} title="Tải lại">
            ↻
          </button>
        </div>
      </div>
      <div className="header-stats">
        <span className="stat-chip stat-pending">🌸 {pending} đang làm</span>
        <span className="stat-chip stat-done">✓ {done} hoàn thành</span>
      </div>
    </header>
  )
}
