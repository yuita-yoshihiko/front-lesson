import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { CategoryBadge } from "@/components/category/CategoryBadge"
import type { Todo } from "@/types/todo"
import type { Category } from "@/types/category"

interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  categoryMap?: Map<string, Category>
}

export function TodoItem({ todo, onToggle, onDelete, categoryMap }: TodoItemProps) {
  /**
   * [js-cache-property-access] ネストプロパティのキャッシュ
   * categoryMap?.get(todo.categoryId) の結果をローカル変数に保持し、
   * 複数回のアクセスを1回に減らす
   */
  const category = todo.categoryId ? categoryMap?.get(todo.categoryId) : undefined

  return (
    <li className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
      <Checkbox
        id={todo.id}
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
      />
      <label
        htmlFor={todo.id}
        className={cn(
          "flex-1 cursor-pointer text-sm",
          todo.completed && "text-muted-foreground line-through"
        )}
      >
        {todo.text}
      </label>
      {/* [rendering-conditional-render] カテゴリが存在する場合のみバッジを表示 */}
      {category ? <CategoryBadge name={category.name} /> : null}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onDelete(todo.id)}
        aria-label="削除"
      >
        <Trash2 />
      </Button>
    </li>
  )
}
