/**
 * [client-localstorage-schema] バージョン付きスキーマで localStorage を管理
 * スキーマバージョンが変わった場合にデフォルト値にフォールバックする
 * BAD: バージョン管理なしでは、スキーマ変更時に破損データを読み込んでしまう
 */

interface StorageSchema<T> {
  version: number
  data: T
}

/**
 * [client-localstorage-schema] バージョン付き localStorage ラッパー
 * データの読み書き時にバージョンを検証し、不整合を防止する
 */
export function createStorage<T>(key: string, version: number, defaultValue: T) {
  return {
    get(): T {
      try {
        const raw = localStorage.getItem(key)
        if (!raw) return defaultValue
        const parsed: StorageSchema<T> = JSON.parse(raw)
        // バージョンが異なる場合はデフォルト値にフォールバック
        if (parsed.version !== version) {
          localStorage.removeItem(key)
          return defaultValue
        }
        return parsed.data
      } catch {
        return defaultValue
      }
    },

    set(data: T): void {
      const schema: StorageSchema<T> = { version, data }
      localStorage.setItem(key, JSON.stringify(schema))
    },

    remove(): void {
      localStorage.removeItem(key)
    },
  }
}
