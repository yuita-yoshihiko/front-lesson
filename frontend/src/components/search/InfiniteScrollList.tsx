import { useState, useRef, useCallback } from "react"
import { usePassiveScroll } from "@/hooks/usePassiveScroll"

interface InfiniteScrollListProps<T> {
  items: T[]
  pageSize: number
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string
}

/**
 * [client-passive-event-listeners] パッシブスクロールで無限スクロールを実装
 * スクロールイベントを passive: true で登録し、スクロールをブロックしない
 */
export function InfiniteScrollList<T>({
  items,
  pageSize,
  renderItem,
  keyExtractor,
}: InfiniteScrollListProps<T>) {
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return
    const { scrollTop, scrollHeight, clientHeight } = el
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      setVisibleCount((prev) => Math.min(prev + pageSize, items.length))
    }
  }, [items.length, pageSize])

  /**
   * [client-passive-event-listeners] usePassiveScroll でパッシブリスナーを登録
   * スクロールパフォーマンスを最大化する
   */
  usePassiveScroll(handleScroll, containerRef)

  const visibleItems = items.slice(0, visibleCount)

  return (
    <div ref={containerRef} className="max-h-96 overflow-y-auto">
      {visibleItems.map((item, index) => (
        <div key={keyExtractor(item)}>{renderItem(item, index)}</div>
      ))}
      {visibleCount < items.length && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          スクロールしてさらに読み込む...
        </p>
      )}
    </div>
  )
}
