import type { Todo } from "@/types/todo"

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
