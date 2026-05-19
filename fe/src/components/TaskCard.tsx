import type { Task } from '../types/task'

const CATEGORY_META: Record<string, { color: string; icon: string; label: string }> = {
  work:     { color: '#1976D2', icon: '💼', label: 'Công việc' },
  health:   { color: '#388E3C', icon: '❤️', label: 'Sức khoẻ' },
  learn:    { color: '#F57C00', icon: '📚', label: 'Học tập' },
  personal: { color: '#7B1FA2', icon: '👤', label: 'Cá nhân' },
  general:  { color: '#607D8B', icon: '📌', label: 'Chung' },
}

interface Props {
  task: Task
  onComplete: () => void
  onDelete: () => void
}

export function TaskCard({ task, onComplete, onDelete }: Props) {
  const meta = CATEGORY_META[task.category ?? 'general'] ?? CATEGORY_META.general

  return (
    <div className={`task-card ${task.completed ? 'task-done' : ''}`}>
      <button
        className={`task-check ${task.completed ? 'checked' : ''}`}
        style={{ borderColor: meta.color, backgroundColor: task.completed ? meta.color : 'transparent' }}
        onClick={onComplete}
        disabled={task.completed}
        aria-label="Đánh dấu hoàn thành"
      >
        {task.completed && '✓'}
      </button>
      <div className="task-body">
        <span className="task-title">{task.title}</span>
        <span className="task-category" style={{ color: meta.color }}>
          {meta.icon} {meta.label}
        </span>
      </div>
      <button className="task-delete" onClick={onDelete} aria-label="Xoá task">
        🗑
      </button>
    </div>
  )
}
