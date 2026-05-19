import type { Task, AISuggestion } from '../types/task'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'
const API = `${BASE_URL}/api/tasks`

const headers = { 'Content-Type': 'application/json; charset=UTF-8' }

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json() as Promise<T>
}

export const api = {
  getTasks: () => fetch(API).then(r => json<Task[]>(r)),

  createTask: (title: string, category: string) =>
    fetch(API, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title, category }),
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

  getSuggestions: async (): Promise<AISuggestion[]> => {
    const res = await fetch(`${API}/suggest`, { method: 'POST' })
    const raw = await json<string[]>(res)
    return raw.map(s => {
      const [title, category] = s.split('|')
      return { title, category: (category ?? 'general') as AISuggestion['category'] }
    })
  },
}
