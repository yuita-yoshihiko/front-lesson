import { useSettings } from "@/hooks/useSettings"
import { Button } from "@/components/ui/button"

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50] as const

/**
 * [js-cache-storage] 表示設定コンポーネント
 * localStorage への書き込みは useSettings 経由で一元管理し、
 * StorageEvent をトリガーとしたキャッシュ更新で読み取りを最適化する
 */
export function DisplaySettings() {
  const { settings, updateSetting, resetSettings } = useSettings()

  return (
    <div className="flex flex-col gap-6">
      {/* 表示件数 */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium">1ページあたりの表示件数</label>
        <div className="flex gap-2">
          {PAGE_SIZE_OPTIONS.map((size) => (
            <Button
              key={size}
              variant={settings.itemsPerPage === size ? "default" : "outline"}
              size="sm"
              onClick={() => updateSetting("itemsPerPage", size)}
            >
              {size}件
            </Button>
          ))}
        </div>
      </div>

      {/* 完了済み表示 */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">完了済みTodoを表示</label>
        <Button
          variant={settings.showCompleted ? "default" : "outline"}
          size="sm"
          onClick={() => updateSetting("showCompleted", !settings.showCompleted)}
        >
          {settings.showCompleted ? "表示中" : "非表示"}
        </Button>
      </div>

      {/* リセット */}
      <div className="border-t border-border pt-4">
        <Button variant="destructive" size="sm" onClick={resetSettings}>
          設定をリセット
        </Button>
      </div>
    </div>
  )
}
