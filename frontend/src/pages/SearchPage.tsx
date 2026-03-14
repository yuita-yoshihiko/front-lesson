import { useTodosApi } from "@/hooks/useTodosApi"
import { useSearch } from "@/hooks/useSearch"
import { SearchInput } from "@/components/search/SearchInput"
import { SearchFilters } from "@/components/search/SearchFilters"
import { SearchResults } from "@/components/search/SearchResults"
import { useEventListener } from "@/hooks/useEventListener"

/**
 * [bundle-dynamic-imports] SearchPage は React.lazy() で遅延読み込み
 *
 * このページで学べるベストプラクティス:
 * - [rerender-transitions] useTransition で検索結果更新を低優先度に
 * - [rerender-move-effect-to-event] 検索実行をイベントハンドラで
 * - [client-event-listeners] グローバルキーボードイベントの重複排除
 * - [client-passive-event-listeners] スクロールに passive オプション
 * - [js-early-exit] フィルタ条件の早期リターン
 * - [js-combine-iterations] 複数 filter/map を1回のループに結合
 */
export default function SearchPage() {
  const { todos, isLoading } = useTodosApi()
  const { query, filters, results, isPending, handleSearch, setFilters } = useSearch(todos)

  /**
   * [client-event-listeners] グローバルキーボードイベントの重複排除
   * useEventListener フックで Escape キーによる検索クリアを実装
   * コンポーネントのアンマウント時に自動的にリスナーが除去される
   */
  useEventListener("keydown", (e) => {
    if (e.key === "Escape" && query) {
      handleSearch("")
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">検索</h1>

      <SearchInput value={query} onChange={handleSearch} isPending={isPending} />
      <SearchFilters filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      ) : (
        <SearchResults results={results} query={query} />
      )}
    </div>
  )
}
