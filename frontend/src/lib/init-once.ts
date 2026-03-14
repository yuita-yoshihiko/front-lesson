/**
 * [advanced-init-once] 初期化処理を一度だけ実行するユーティリティ
 * 複数回呼び出されても初回のみ実行し、以降はキャッシュされた結果を返す
 * BAD: グローバル変数で初期化済みフラグを管理すると、状態が散逸する
 */
export function initOnce<T>(fn: () => T): () => T {
  let result: T
  let initialized = false

  return () => {
    if (!initialized) {
      result = fn()
      initialized = true
    }
    return result
  }
}
