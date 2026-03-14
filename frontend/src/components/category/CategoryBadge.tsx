import { cn } from "@/lib/utils"

interface CategoryBadgeProps {
  name: string
  className?: string
}

export function CategoryBadge({ name, className }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground",
        className
      )}
    >
      {name}
    </span>
  )
}
