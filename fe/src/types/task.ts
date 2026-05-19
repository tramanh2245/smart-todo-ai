export type Category = 'work' | 'health' | 'learn' | 'personal' | 'general'

export interface Task {
  id: number
  title: string
  category: Category | null
  completed: boolean
  createdAt: string | null
  completedAt: string | null
}

export interface AISuggestion {
  title: string
  category: Category
}
