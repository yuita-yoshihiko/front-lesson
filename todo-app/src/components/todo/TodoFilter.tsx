import { Button } from "@/components/ui/button"
import type { FilterType } from "@/types/todo"

interface Counts {
  all: number
  active: number
  completed: number
}

interface TodoFilterProps {
  current: FilterType
  onChange: (filter: FilterType) => void
  counts: Counts
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: "all", label: "すべて" },
  { value: "active", label: "未完了" },
  { value: "completed", label: "完了済み" },
]

export function TodoFilter({ current, onChange, counts }: TodoFilterProps) {
  return (
    <div className="flex gap-1">
      {FILTERS.map(({ value, label }) => (
        <Button
          key={value}
          variant={current === value ? "default" : "ghost"}
          size="sm"
          onClick={() => onChange(value)}
        >
          {label}
          <span className="ml-1 text-xs opacity-70">({counts[value]})</span>
        </Button>
      ))}
    </div>
  )
}
