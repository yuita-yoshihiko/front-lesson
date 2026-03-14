import { useRef } from "react"
import { useCategories } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"

export function CategoryList() {
  const { categories, isLoading, addCategory, deleteCategory } = useCategories()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAdd = () => {
    const value = inputRef.current?.value?.trim()
    if (!value) return
    addCategory(value)
    if (inputRef.current) inputRef.current.value = ""
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">読み込み中...</p>
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <Input ref={inputRef} placeholder="新しいカテゴリ..." className="flex-1" />
        <Button size="sm" onClick={handleAdd}>
          <Plus className="h-4 w-4" />
          追加
        </Button>
      </div>
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">カテゴリがありません</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-sm"
            >
              {cat.name}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => deleteCategory(cat.id)}
                aria-label={`${cat.name}を削除`}
              >
                <X className="h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
