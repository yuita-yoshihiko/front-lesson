import { Button } from "@/components/ui/button"

interface SearchFiltersProps {
  filters: {
    status: "all" | "active" | "completed"
    sortBy: "newest" | "oldest" | "alphabetical"
  }
  onFilterChange: (filters: SearchFiltersProps["filters"]) => void
}

const STATUS_OPTIONS = [
  { value: "all" as const, label: "すべて" },
  { value: "active" as const, label: "未完了" },
  { value: "completed" as const, label: "完了済み" },
]

const SORT_OPTIONS = [
  { value: "newest" as const, label: "新しい順" },
  { value: "oldest" as const, label: "古い順" },
  { value: "alphabetical" as const, label: "名前順" },
]

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">ステータス</span>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map(({ value, label }) => (
            <Button
              key={value}
              variant={filters.status === value ? "default" : "ghost"}
              size="xs"
              onClick={() => onFilterChange({ ...filters, status: value })}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs font-medium text-muted-foreground">並び順</span>
        <div className="flex gap-1">
          {SORT_OPTIONS.map(({ value, label }) => (
            <Button
              key={value}
              variant={filters.sortBy === value ? "default" : "ghost"}
              size="xs"
              onClick={() => onFilterChange({ ...filters, sortBy: value })}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
