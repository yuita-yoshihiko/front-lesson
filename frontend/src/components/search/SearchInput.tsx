import { useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  isPending: boolean
}

/**
 * [rerender-move-effect-to-event] 検索をイベントハンドラで直接実行
 * BAD: useEffect で入力値を監視→デバウンス→検索実行のパターン
 */
export function SearchInput({ value, onChange, isPending }: SearchInputProps) {
  /**
   * [rerender-use-ref-transient-values] input要素のrefで直接値を管理
   * 入力ごとの再レンダーを最小限に抑える
   */
  const inputRef = useRef<HTMLInputElement>(null)

  const handleClear = useCallback(() => {
    onChange("")
    if (inputRef.current) inputRef.current.value = ""
    inputRef.current?.focus()
  }, [onChange])

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        defaultValue={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Todoを検索..."
        className="pl-9 pr-9"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={handleClear}
          aria-label="検索をクリア"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
      {/**
       * [rendering-usetransition-loading] isPending でローディング状態を表示
       * useTransition の isPending を使って、低優先度更新中のインジケーターを表示する
       */}
      {isPending && (
        <div className="absolute right-10 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}
