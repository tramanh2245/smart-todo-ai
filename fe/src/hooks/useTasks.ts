import { useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'
import type { Task, AISuggestion, Category } from '../types/task'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.getTasks()
      setTasks(data)
    } catch {
      setError('Không thể kết nối server. Kiểm tra backend đã chạy chưa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadTasks() }, [loadTasks])

  const addTask = async (title: string, category: Category, startTime?: string | null, endTime?: string | null) => {
    const task = await api.createTask(title, category, startTime, endTime)
    setTasks(prev => [task, ...prev])
  }

  const completeTask = async (task: Task) => {
    const updated = await api.updateTask(task.id, {
      ...task,
      completed: true,
    })
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t))
  }

  const deleteTask = async (id: number) => {
    await api.deleteTask(id)
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const loadSuggestions = async () => {
    setSuggestLoading(true)
    try {
      const data = await api.getSuggestions()
      setSuggestions(data)
    } catch {
      setError('AI gợi ý thất bại.')
    } finally {
      setSuggestLoading(false)
    }
  }

  const addFromSuggestion = async (s: AISuggestion) => {
    const task = await api.createTask(s.title, s.category)
    setTasks(prev => [task, ...prev])
    setSuggestions(prev => prev.filter(x => x.title !== s.title))
  }

  const dismissSuggestion = (title: string) => {
    setSuggestions(prev => prev.filter(s => s.title !== title))
  }

  return {
    tasks,
    suggestions,
    loading,
    suggestLoading,
    error,
    loadTasks,
    addTask,
    completeTask,
    deleteTask,
    loadSuggestions,
    addFromSuggestion,
    dismissSuggestion,
  }
}
