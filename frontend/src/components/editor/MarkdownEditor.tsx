import { useState, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { loadFeatureModule } from "@/lib/feature-flags"
import { Eye, EyeOff } from "lucide-react"

/**
 * [bundle-dynamic-imports] MarkdownPreview を動的読み込み
 * react-markdown ライブラリは約30KBあるため、プレビュー表示時のみロードする
 * BAD: import { MarkdownPreview } from "./MarkdownPreview" で常にバンドルに含める
 */
const MarkdownPreview = lazy(() =>
  import("./MarkdownPreview").then((mod) => ({ default: mod.MarkdownPreview }))
)

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
}

/**
 * [bundle-conditional] フィーチャーフラグで条件付きに Markdown エディタを読み込み
 * フラグが無効な場合はプレーンテキストエリアのみ表示する
 */
export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false)

  /**
   * [async-defer-await] プレビュー表示時のみ動的モジュールを読み込む
   * await は実際に使うブランチまで遅延する
   */
  const handleTogglePreview = async () => {
    if (!showPreview) {
      // プレビュー表示時にモジュールをプリロード
      await loadFeatureModule("enableMarkdownEditor", () =>
        import("./MarkdownPreview")
      )
    }
    setShowPreview(!showPreview)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">説明（Markdown対応）</label>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleTogglePreview}
          className="gap-1"
        >
          {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          {showPreview ? "編集" : "プレビュー"}
        </Button>
      </div>

      {showPreview ? (
        <Suspense
          fallback={
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              プレビューを読み込み中...
            </div>
          }
        >
          <MarkdownPreview content={value} />
        </Suspense>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Markdown形式で説明を入力..."
          className="min-h-24 rounded-lg border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      )}
    </div>
  )
}
