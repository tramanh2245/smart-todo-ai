import { useState, useEffect } from 'react'
import { useTasks } from './hooks/useTasks'
import { Header } from './components/Header'
import { AddTaskForm } from './components/AddTaskForm'
import { SuggestionChips } from './components/SuggestionChips'
import { DaySection } from './components/DaySection'
import { api } from './services/api'
import type { DayNote } from './types/task'

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function App() {
  const {
    tasks, suggestions, loading, suggestLoading, error,
    loadTasks, addTask, completeTask, deleteTask,
    loadSuggestions, addFromSuggestion, dismissSuggestion,
  } = useTasks()

  const [dayNotes, setDayNotes] = useState<Record<string, string>>({})

  useEffect(() => {
    api.getDayNotes().then(notes => {
      const map: Record<string, string> = {}
      notes.forEach((n: DayNote) => { map[n.noteDate] = n.content ?? '' })
      setDayNotes(map)
    }).catch(() => {})
  }, [])

  // Group tasks by taskDate, fallback to today
  const today = todayStr()
  const grouped: Record<string, typeof tasks> = {}

  // Always show today
  grouped[today] = []
  tasks.forEach(t => {
    const d = t.taskDate ?? today
    if (!grouped[d]) grouped[d] = []
    grouped[d].push(t)
  })

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="app">
      <Header
        tasks={tasks}
        suggestLoading={suggestLoading}
        onSuggest={loadSuggestions}
        onRefresh={loadTasks}
      />

      <main className="main">
        <AddTaskForm onAdd={addTask} />

        {error && (
          <div className="error-banner">
            ⚠️ {error}
            <button onClick={() => loadTasks()}>Thử lại</button>
          </div>
        )}

        <SuggestionChips
          suggestions={suggestions}
          onAdd={addFromSuggestion}
          onDismiss={dismissSuggestion}
        />

        {loading ? (
          <div className="loading">
            <span className="spinner" />
            <span>Đang tải...</span>
          </div>
        ) : tasks.length === 0 && (
          <div className="empty">
            <div className="empty-icon">🌸</div>
            <p>Ngày mới bắt đầu</p>
            <p className="empty-sub">Thêm việc đầu tiên hoặc nhấn ✨ để AI gợi ý</p>
          </div>
        ) || (
          sortedDates.map(date => (
            <DaySection
              key={date}
              date={date}
              tasks={grouped[date] ?? []}
              initialNote={dayNotes[date] ?? ''}
              onComplete={completeTask}
              onDelete={deleteTask}
            />
          ))
        )}
      </main>
    </div>
  )
}
