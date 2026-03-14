import { useRef } from "react"
import { useBatchDom } from "@/hooks/useBatchDom"
import { usePassiveScroll } from "@/hooks/usePassiveScroll"

interface VirtualizedListProps<T> {
  items: T[]
  itemHeight: number
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

/**
 * [rendering-content-visibility] content-visibility を使ったリスト仮想化
 * CSSのcontent-visibilityプロパティでビューポート外の要素のレンダリングをスキップする
 * 完全な仮想化ライブラリと比べて実装がシンプルで、多くのケースで十分なパフォーマンスを得られる
 */
export function VirtualizedList<T>({
  items,
  itemHeight,
  renderItem,
  keyExtractor,
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { batchUpdate } = useBatchDom()

  /**
   * [js-batch-dom-css] スクロール時のDOM操作をバッチ化
   * requestAnimationFrame で複数のスタイル更新を1フレームにまとめる
   */
  usePassiveScroll(() => {
    batchUpdate(() => {
      // スクロール位置に応じたスタイル更新（将来の拡張用）
      const container = containerRef.current
      if (!container) return
      // content-visibility に委任しているため、追加のDOM操作は不要
      // 将来的にはスクロール位置に応じたスタイル更新をここで行う
      void container.scrollTop
    })
  }, containerRef)

  return (
    <div ref={containerRef} className="max-h-96 overflow-y-auto">
      {items.map((item) => (
        <div
          key={keyExtractor(item)}
          style={{
            /**
             * [rendering-content-visibility] content-visibility: auto で
             * ブラウザがビューポート外の要素のレンダリングを自動的にスキップ
             * containIntrinsicSize でスキップ時の推定サイズを指定し、
             * スクロールバーのジャンプを防ぐ
             */
            contentVisibility: "auto",
            containIntrinsicSize: `0 ${itemHeight}px`,
          }}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  )
}
