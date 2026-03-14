import Markdown from "react-markdown"

interface MarkdownPreviewProps {
  content: string
}

/**
 * [bundle-dynamic-imports] MarkdownPreview は動的読み込み対象
 * react-markdown は大きなライブラリなので、必要な時のみロードする
 */
export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none rounded-lg border border-border bg-card p-4">
      {content ? (
        <Markdown>{content}</Markdown>
      ) : (
        <p className="text-muted-foreground">プレビューするコンテンツがありません</p>
      )}
    </div>
  )
}
