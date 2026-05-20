import type { Task, AISuggestion, DayNote } from '../types/task'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const API = `${BASE_URL}/api/tasks`

const headers = { 'Content-Type': 'application/json; charset=UTF-8' }

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  getTasks: () => fetch(API).then(r => json<Task[]>(r)),

  createTask: (title: string, category: string, startTime?: string | null, endTime?: string | null, taskDate?: string | null) =>
    fetch(API, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, category, startTime: startTime ?? null, endTime: endTime ?? null, taskDate: taskDate ?? null }),
    }).then(r => json<Task>(r)),

  updateTask: (id: number, data: Partial<Task>) =>
    fetch(`${API}/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    }).then(r => json<Task>(r)),

  deleteTask: (id: number) =>
    fetch(`${API}/${id}`, { method: 'DELETE' }).then(r => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
    }),

  getDayNotes: () => fetch(`${BASE_URL}/api/day-notes`).then(r => json<DayNote[]>(r)),

  saveDayNote: (date: string, content: string) =>
    fetch(`${BASE_URL}/api/day-notes/${date}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ noteDate: date, content }),
    }).then(r => json<DayNote>(r)),

  getSuggestions: async (): Promise<AISuggestion[]> => {
    const res = await fetch(`${API}/suggest`, { method: 'POST' })
    const raw = await json<string[]>(res)
    return raw.map(s => {
      const [title, category] = s.split('|')
      return { title, category: (category ?? 'general') as AISuggestion['category'] }
    })
  },
}
