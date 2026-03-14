import { useTheme } from "@/hooks/useTheme"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor } from "lucide-react"

const THEMES = [
  { value: "light" as const, label: "ライト", icon: <Sun className="h-4 w-4" /> },
  { value: "dark" as const, label: "ダーク", icon: <Moon className="h-4 w-4" /> },
  { value: "system" as const, label: "システム", icon: <Monitor className="h-4 w-4" /> },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">テーマ</label>
      <div className="flex gap-2">
        {/* [rendering-conditional-render] 三項演算子でアクティブ状態を明示的に切替 */}
        {THEMES.map(({ value, label, icon }) => (
          <Button
            key={value}
            variant={theme === value ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme(value)}
            className="gap-2"
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
