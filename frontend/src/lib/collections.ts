/**
 * [js-set-map-lookups] Map/Set ユーティリティ
 * Map と Set を使って O(1) のルックアップを実現する
 * BAD: Array.find() は O(n) なので、大量データでの検索が遅い
 */

/**
 * [js-index-maps] 配列から ID→アイテム の Map インデックスを構築
 * 一度 Map を構築すれば、以降の ID 検索は O(1) で行える
 * BAD: 毎回 array.find(item => item.id === id) で検索すると O(n)
 */
export function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  const map = new Map<string, T>()
  for (const item of items) {
    map.set(item.id, item)
  }
  return map
}

/**
 * [js-set-map-lookups] ID の Set を構築し O(1) で存在チェック
 * BAD: array.includes(id) は O(n) で毎回線形探索する
 */
export function idSet<T extends { id: string }>(items: T[]): Set<string> {
  const set = new Set<string>()
  for (const item of items) {
    set.add(item.id)
  }
  return set
}
