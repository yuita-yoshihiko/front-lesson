import { ThemeToggle } from "@/components/settings/ThemeToggle"
import { DisplaySettings } from "@/components/settings/DisplaySettings"
import { KeyboardShortcuts } from "@/components/shortcuts/KeyboardShortcuts"

/**
 * [bundle-dynamic-imports] SettingsPage は React.lazy() で遅延読み込み
 *
 * このページで学べるベストプラクティス:
 * - [client-localstorage-schema] バージョン付きスキーマで localStorage 管理
 * - [rerender-lazy-state-init] localStorage 初期読み込みをコールバック形式で
 * - [rerender-functional-setstate] 関数型 setState で設定更新
 * - [advanced-init-once] テーマ初期化を一度だけ実行
 * - [advanced-use-latest] コールバック内で最新の設定値を参照
 */
export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">設定</h1>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">外観</h2>
        <ThemeToggle />
      </section>

      <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">表示設定</h2>
        <DisplaySettings />
      </section>

      <section>
        <KeyboardShortcuts />
      </section>
    </div>
  )
}
