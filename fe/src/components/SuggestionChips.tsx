import type { AISuggestion } from '../types/task'

interface Props {
  suggestions: AISuggestion[]
  onAdd: (s: AISuggestion) => void
  onDismiss: (title: string) => void
}

export function SuggestionChips({ suggestions, onAdd, onDismiss }: Props) {
  if (suggestions.length === 0) return null

  return (
    <section className="suggestions">
      <p className="suggestions-label">✨ AI gợi ý cho bạn:</p>
      <div className="chips-wrap">
        {suggestions.map(s => (
          <div key={s.title} className="chip">
            <button className="chip-add" onClick={() => onAdd(s)}>
              + {s.title}
            </button>
            <button className="chip-dismiss" onClick={() => onDismiss(s.title)} aria-label="Bỏ qua">
              ×
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}
