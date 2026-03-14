import { useCategories } from "@/hooks/useCategories"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CategoryPickerProps {
  value: string
  onChange: (categoryId: string) => void
}

/**
 * [js-set-map-lookups] カテゴリ選択UIでMap/Setを活用
 * カテゴリ一覧は useCategories の categoryMap で O(1) 検索を提供する
 */
export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const { categories, isLoading } = useCategories()

  if (isLoading) return null

  return (
    <div className="flex flex-wrap gap-1">
      <Button
        variant={value === "" ? "default" : "ghost"}
        size="xs"
        onClick={() => onChange("")}
      >
        なし
      </Button>
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={value === cat.id ? "default" : "ghost"}
          size="xs"
          onClick={() => onChange(cat.id)}
          className={cn(value === cat.id && "ring-1 ring-ring")}
        >
          {cat.name}
        </Button>
      ))}
    </div>
  )
}
