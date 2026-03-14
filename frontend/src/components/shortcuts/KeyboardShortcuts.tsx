interface ShortcutInfo {
  keys: string
  description: string
}

const SHORTCUTS: ShortcutInfo[] = [
  { keys: "Escape", description: "検索をクリア" },
  { keys: "Ctrl+K", description: "検索にフォーカス" },
  { keys: "Ctrl+,", description: "設定を開く" },
]

/**
 * [rendering-hoist-jsx] 静的なショートカット一覧をコンポーネント外に定義
 * 毎回のレンダーで新しいオブジェクトを生成しない
 */
export function KeyboardShortcuts() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">キーボードショートカット</h3>
      <ul className="flex flex-col gap-2">
        {SHORTCUTS.map(({ keys, description }) => (
          <li key={keys} className="flex items-center justify-between text-sm">
            <span>{description}</span>
            <kbd className="rounded bg-muted px-2 py-0.5 text-xs font-mono">{keys}</kbd>
          </li>
        ))}
      </ul>
    </div>
  )
}
