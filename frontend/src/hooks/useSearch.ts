import { useState, useTransition, useCallback, useRef } from "react"
import type { Todo } from "@/types/todo"

/**
 * [js-hoist-regexp] 検索用正規表現をループ外に定義
 * ループ内で new RegExp() を呼ぶと毎回コンパイルコストが発生する
 * BAD: todos.filter(t => new RegExp(query, 'i').test(t.text))
 */
function createSearchRegex(query: string): RegExp | null {
  if (!query.trim()) return null
  try {
    return new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
  } catch {
    return null
  }
}

interface SearchFilters {
  status: "all" | "active" | "completed"
  sortBy: "newest" | "oldest" | "alphabetical"
}

const DEFAULT_FILTERS: SearchFilters = {
  status: "all",
  sortBy: "newest",
}

export function useSearch(todos: Todo[]) {
  const [query, setQuery] = useState("")
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS)

  /**
   * [rerender-transitions] useTransition で検索結果更新を低優先度に設定
   * 入力フィールドの応答性を維持しつつ、結果リストの更新を遅延させる
   * BAD: 入力と結果更新を同じ優先度で処理すると、入力がカクつく
   */
  const [isPending, startTransition] = useTransition()

  /**
   * [rerender-use-ref-transient-values] デバウンスタイマーIDを ref で管理
   * state ではなく ref を使うことで、タイマーIDの更新が再レンダーを引き起こさない
   */
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  /**
   * [rerender-move-effect-to-event] 検索実行をイベントハンドラ内で直接行う
   * BAD: useEffect で query の変化を監視して検索するパターンは
   *      不要な副作用の連鎖と余分なレンダーを引き起こす
   */
  const handleSearch = useCallback((newQuery: string) => {
    setQuery(newQuery)

    if (timerRef.current) clearTimeout(timerRef.current)

    timerRef.current = setTimeout(() => {
      /**
       * [rerender-transitions] startTransition で低優先度更新をラップ
       * [rendering-usetransition-loading] isPending でローディング状態を表示
       */
      startTransition(() => {
        // 検索クエリの更新は transition 内で行われる
        setQuery(newQuery)
      })
    }, 200)
  }, [])

  /**
   * [js-combine-iterations] 複数の filter/map を1回のループに結合
   * BAD: todos.filter(...).filter(...).sort(...) と3回イテレーションする
   */
  const results = (() => {
    /**
     * [js-length-check-first] 配列操作前の length チェック
     * 空配列に対するフィルタ/ソートは無駄な処理なので早期リターンする
     */
    if (todos.length === 0) return []

    const regex = createSearchRegex(query)

    /**
     * [js-early-exit] フィルタ条件の早期リターン
     * クエリもフィルタも未設定なら、全件をそのまま返す
     */
    if (!regex && filters.status === "all" && filters.sortBy === "newest") {
      return todos
    }

    // [js-combine-iterations] 1回のループでフィルタリングを完了
    const filtered: Todo[] = []
    for (const todo of todos) {
      // テキスト検索
      if (regex && !regex.test(todo.text)) continue
      // ステータスフィルタ
      if (filters.status === "active" && todo.completed) continue
      if (filters.status === "completed" && !todo.completed) continue
      filtered.push(todo)
    }

    // ソート
    if (filters.sortBy === "oldest") {
      filtered.sort((a, b) => a.createdAt - b.createdAt)
    } else if (filters.sortBy === "alphabetical") {
      filtered.sort((a, b) => a.text.localeCompare(b.text))
    }
    // "newest" はデフォルトの降順のまま

    return filtered
  })()

  return {
    query,
    filters,
    results,
    isPending,
    handleSearch,
    setFilters,
  }
}
