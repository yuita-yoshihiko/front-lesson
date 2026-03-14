import type { Todo } from "@/types/todo"
import type { Category } from "@/types/category"

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`${init?.method ?? "GET"} ${path} failed: ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// Stats 型定義
export interface Stats {
  total: number
  active: number
  completed: number
  rate: number
}

export const statsApi = {
  get: () => request<Stats>("/api/stats"),
  recent: () => request<Todo[]>("/api/todos/recent"),
}

// Activity 型定義
export interface Activity {
  id: string
  action: string
  todoId: string
  todoText: string
  createdAt: number
}

export const activityApi = {
  list: () => request<Activity[]>("/api/activities"),
}

export const categoryApi = {
  list: () => request<Category[]>("/api/categories"),

  create: (name: string) =>
    request<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  delete: (id: string) =>
    request<void>(`/api/categories/${id}`, { method: "DELETE" }),
}

export const todoApi = {
  list: () => request<Todo[]>("/api/todos"),

  create: (text: string) =>
    request<Todo>("/api/todos", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  update: (id: string, patch: { text?: string; completed?: boolean }) =>
    request<Todo>(`/api/todos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(patch),
    }),

  delete: (id: string) =>
    request<void>(`/api/todos/${id}`, { method: "DELETE" }),
}
