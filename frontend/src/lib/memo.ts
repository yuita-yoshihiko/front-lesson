/**
 * [js-cache-function-results] 関数結果メモ化ユーティリティ
 * 同じ引数で呼ばれた関数の結果をキャッシュし、再計算を避ける
 * BAD: 毎回同じ引数で重い計算を実行すると無駄なCPU使用量が発生する
 */
export function memoize<Args extends unknown[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R {
  const cache = new Map<string, R>()

  return (...args: Args): R => {
    const key = JSON.stringify(args)

    /**
     * [js-cache-property-access] Map.has + Map.get の代わりに
     * get してから undefined チェックする方が1回のルックアップで済む
     */
    const cached = cache.get(key)
    if (cached !== undefined) return cached

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}
