/**
 * [bundle-defer-third-party] アナリティクスモック
 * サードパーティのアナリティクスSDKを hydration 後に遅延読み込みする
 * BAD: import文でトップレベルに読み込むと初期バンドルサイズが増大する
 */

interface AnalyticsEvent {
  name: string
  properties?: Record<string, unknown>
}

// [bundle-defer-third-party] イベントキューで遅延読み込み前のイベントをバッファリング
const eventQueue: AnalyticsEvent[] = []
let initialized = false

/**
 * [bundle-defer-third-party] アナリティクスの初期化を hydration 後に遅延実行
 * requestIdleCallback を使い、メインスレッドがアイドル状態になった時に初期化する
 */
export function initAnalytics(): void {
  if (initialized) return

  const init = () => {
    initialized = true
    console.log("[Analytics] 初期化完了（モック）")
    // キューに溜まったイベントをフラッシュ
    eventQueue.forEach((event) => {
      console.log("[Analytics] フラッシュ:", event.name, event.properties)
    })
    eventQueue.length = 0
  }

  // [rendering-script-defer-async] requestIdleCallback でメインスレッドをブロックしない
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(init)
  } else {
    setTimeout(init, 1)
  }
}

export function trackEvent(name: string, properties?: Record<string, unknown>): void {
  if (!initialized) {
    eventQueue.push({ name, properties })
    return
  }
  console.log("[Analytics] イベント:", name, properties)
}

export function trackPageView(path: string): void {
  trackEvent("page_view", { path })
}
