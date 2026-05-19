import { useTasks } from './hooks/useTasks'
import { Header } from './components/Header'
import { AddTaskForm } from './components/AddTaskForm'
import { SuggestionChips } from './components/SuggestionChips'
import { TaskCard } from './components/TaskCard'

export default function App() {
  const {
    tasks, suggestions, loading, suggestLoading, error,
    loadTasks, addTask, completeTask, deleteTask,
    loadSuggestions, addFromSuggestion, dismissSuggestion,
  } = useTasks()

  const pending = tasks.filter(t => !t.completed)
  const done = tasks.filter(t => t.completed)

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
        ) : (
          <>
            {pending.length > 0 && (
              <section>
                <h2 className="section-title">Đang làm ({pending.length})</h2>
                {pending.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onComplete={() => completeTask(t)}
                    onDelete={() => deleteTask(t.id)}
                  />
                ))}
              </section>
            )}

            {done.length > 0 && (
              <section>
                <h2 className="section-title done-title">Hoàn thành ({done.length})</h2>
                {done.map(t => (
                  <TaskCard
                    key={t.id}
                    task={t}
                    onComplete={() => {}}
                    onDelete={() => deleteTask(t.id)}
                  />
                ))}
              </section>
            )}

            {tasks.length === 0 && !loading && (
              <div className="empty">
                <div className="empty-icon">✓</div>
                <p>Chưa có task nào</p>
                <p className="empty-sub">Thêm task đầu tiên hoặc nhấn ✨ để AI gợi ý</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
