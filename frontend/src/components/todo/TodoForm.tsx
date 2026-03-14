import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TodoFormProps {
  onAdd: (text: string) => void
}

export function TodoForm({ onAdd }: TodoFormProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = inputRef.current?.value ?? ""
    if (!value.trim()) return
    onAdd(value)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        ref={inputRef}
        placeholder="新しいTodoを入力..."
        className="flex-1"
      />
      <Button type="submit">追加</Button>
    </form>
  )
}
