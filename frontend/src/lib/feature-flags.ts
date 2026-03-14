/**
 * [bundle-conditional] フィーチャーフラグによる条件付きモジュール読み込み
 * 不要な機能のコードをバンドルに含めず、必要な場合のみ動的に読み込む
 * BAD: import { HeavyModule } from "./heavy" のように常にインポートする
 */

// [bundle-conditional] フラグはサーバーや環境変数から取得する想定
const flags: Record<string, boolean> = {
  enableMarkdownEditor: true,
  enableActivityLog: true,
  enableDashboardCharts: true,
}

export function isFeatureEnabled(feature: string): boolean {
  return flags[feature] ?? false
}

/**
 * [bundle-conditional] フラグが有効な場合のみモジュールを動的読み込みする
 * これにより無効な機能のコードがバンドルに含まれない
 */
export async function loadFeatureModule<T>(
  feature: string,
  loader: () => Promise<T>
): Promise<T | null> {
  if (!isFeatureEnabled(feature)) return null
  return loader()
}
