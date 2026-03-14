# React Best Practices 学習プラットフォーム - 実装計画

## Context

現在のプロジェクトはシンプルなTodo CRUDアプリ（React 19 + Vite + Go + PostgreSQL）。
Vercel の React Best Practices（全62ルール/8カテゴリ）を網羅的に学べるよう、機能を拡張する。
全てのベストプラクティス適用箇所には日本語コードコメントで `[ルール名]` を付与し、何を学んでいるか一目でわかるようにする。

---

## コメント規約

```typescript
// [ルール名] 日本語の説明（なぜこのパターンが有効か）

// 複数行の場合:
/**
 * [ルール名] 要約
 * 詳細: なぜこのパターンを採用するか
 * BAD: アンチパターンの例（学習用）
 */
```

---

## フェーズ 1: ルーティング基盤 + コード分割

**目的**: React Router によるマルチページ化、遅延読み込み、Suspense境界

**追加パッケージ**: `react-router-dom`

### 対象ルール (9個)
| ルール | 適用箇所 |
|---|---|
| `bundle-dynamic-imports` | `React.lazy()` で各ページを遅延読み込み |
| `bundle-barrel-imports` | 全ファイルで直接インポート徹底 |
| `bundle-preload` | ナビリンク hover/focus でチャンクをプリロード |
| `bundle-defer-third-party` | アナリティクスモックを hydration 後に読み込み |
| `bundle-conditional` | フィーチャーフラグで条件付きモジュール読み込み |
| `async-suspense-boundaries` | 各ルートを `<Suspense>` で囲む |
| `rendering-conditional-render` | 三項演算子で明示的条件レンダリング |
| `rendering-resource-hints` | `preconnect` をAPIサーバー向けに設定 |
| `rendering-script-defer-async` | サードパーティスクリプトの遅延パターン |

### ファイル操作
```
修正:
  frontend/src/main.tsx              # RouterProvider追加
  frontend/src/App.tsx               # ルーターアウトレットに変更

新規:
  frontend/src/router.tsx            # ルート定義（React.lazy + Suspense）
  frontend/src/layouts/AppLayout.tsx  # 共通レイアウト（ナビ、Suspense境界）
  frontend/src/pages/TodoPage.tsx    # 既存App.tsxの内容を移動
  frontend/src/pages/DashboardPage.tsx  # スタブ（フェーズ2で実装）
  frontend/src/pages/SettingsPage.tsx   # スタブ（フェーズ3で実装）
  frontend/src/pages/SearchPage.tsx     # スタブ（フェーズ4で実装）
  frontend/src/pages/ActivityPage.tsx   # スタブ（フェーズ6で実装）
  frontend/src/components/nav/NavLink.tsx  # hover時プリロードするナビリンク
  frontend/src/lib/preload.ts        # ルートプリロードユーティリティ
  frontend/src/lib/feature-flags.ts  # 条件付きモジュール読み込み
  frontend/src/lib/analytics.ts      # 遅延読み込みアナリティクスモック
```

---

## フェーズ 2: ダッシュボード + 並列データフェッチ

**目的**: Todo統計ダッシュボードで並列フェッチ、派生状態、メモ化を実践

**新規APIエンドポイント**: `GET /api/stats`, `GET /api/todos/recent`

### 対象ルール (12個)
| ルール | 適用箇所 |
|---|---|
| `async-parallel` | `Promise.all()` で stats + recent を並列取得 |
| `async-defer-await` | await を実際に使うブランチまで遅延 |
| `async-dependencies` | 部分依存の Promise.all 応用パターン |
| `rerender-derived-state` | 統計データからグラフ用データを導出 |
| `rerender-derived-state-no-effect` | useEffect を使わず render フェーズで計算 |
| `rerender-memo` | 重い統計計算を memo コンポーネントで最適化 |
| `rerender-memo-with-default-value` | memo のデフォルト非プリミティブ値を定数化 |
| `rerender-dependencies` | 依存配列でプリミティブ値を指定 |
| `rerender-simple-expression-in-memo` | 単純な式を useMemo に入れない |
| `rerender-no-inline-components` | コンポーネント内でコンポーネント定義しない |
| `rendering-hoist-jsx` | 静的JSXをコンポーネント外に巻き上げ |
| `server-parallel-fetching` | Go goroutine で並列DBクエリ |

### ファイル操作
```
新規:
  frontend/src/pages/DashboardPage.tsx      # 統計ダッシュボード
  frontend/src/components/dashboard/StatsOverview.tsx    # 概要カード
  frontend/src/components/dashboard/CompletionChart.tsx  # 完了率SVGチャート
  frontend/src/components/dashboard/RecentActivity.tsx   # 最近のアクティビティ
  frontend/src/hooks/useDashboardData.ts    # 並列フェッチ + 派生状態
  frontend/src/hooks/useStats.ts            # 統計API
  backend/internal/handler/stats.go         # 統計ハンドラ
  backend/internal/model/stats.go           # 統計モデル

修正:
  frontend/src/lib/api.ts                   # stats/recent API追加
  backend/internal/store/store.go           # Stats/Recent メソッド追加
  backend/internal/store/postgres.go        # 統計クエリ追加
  backend/main.go                           # ルート登録
```

---

## フェーズ 3: 設定ページ + localStorage + テーマ

**目的**: ユーザー設定の永続化、localStorageスキーマバージョニング、テーマ管理

### 対象ルール (8個)
| ルール | 適用箇所 |
|---|---|
| `client-localstorage-schema` | バージョン付きスキーマで localStorage 管理 |
| `rerender-lazy-state-init` | localStorage 初期読み込みをコールバック形式で |
| `rerender-functional-setstate` | 設定更新を関数型 setState で |
| `js-cache-storage` | StorageEvent + キャッシュで読み取り最適化 |
| `advanced-init-once` | 設定の初期化を一度だけ実行 |
| `advanced-use-latest` | コールバック内で最新の設定値を参照 |
| `server-cache-lru` | Go バックエンドで LRU キャッシュ実装 |
| `server-auth-actions` | 認証ミドルウェア雛形 |

### ファイル操作
```
新規:
  frontend/src/pages/SettingsPage.tsx           # 設定ページ
  frontend/src/components/settings/ThemeToggle.tsx      # テーマ切替
  frontend/src/components/settings/DisplaySettings.tsx  # 表示設定
  frontend/src/hooks/useSettings.ts             # 設定管理フック
  frontend/src/hooks/useTheme.ts                # テーマ管理フック
  frontend/src/hooks/useLatest.ts               # useLatest カスタムフック
  frontend/src/lib/storage.ts                   # バージョン付き localStorage ラッパー
  frontend/src/lib/init-once.ts                 # 初期化ユーティリティ
  frontend/src/contexts/SettingsContext.tsx      # 設定コンテキスト
  backend/internal/middleware/cache.go          # LRU キャッシュミドルウェア
  backend/internal/middleware/auth.go           # 認証ミドルウェア雛形
```

---

## フェーズ 4: 高度な検索 + トランジション

**目的**: リアルタイム検索UI、useTransition、パッシブイベントリスナー

### 対象ルール (11個)
| ルール | 適用箇所 |
|---|---|
| `rerender-transitions` | `useTransition` で検索結果更新を低優先度に |
| `rerender-defer-reads` | searchParams をコールバック内でのみ読み取る |
| `rerender-move-effect-to-event` | 検索実行を useEffect ではなくイベントハンドラで |
| `rerender-use-ref-transient-values` | デバウンスタイマーIDを ref で管理 |
| `client-event-listeners` | グローバルキーボードイベントの重複排除 |
| `client-passive-event-listeners` | スクロールイベントに passive オプション |
| `rendering-usetransition-loading` | `isPending` でローディング表示 |
| `js-early-exit` | フィルタ条件の早期リターン |
| `js-length-check-first` | 配列操作前の length チェック |
| `js-hoist-regexp` | 検索用正規表現をループ外に定義 |
| `js-combine-iterations` | 複数 filter/map を1回のループに結合 |

### ファイル操作
```
新規:
  frontend/src/pages/SearchPage.tsx                   # 検索ページ
  frontend/src/components/search/SearchInput.tsx       # デバウンス付き検索入力
  frontend/src/components/search/SearchResults.tsx     # 検索結果表示
  frontend/src/components/search/SearchFilters.tsx     # 詳細フィルター
  frontend/src/components/search/InfiniteScrollList.tsx # 無限スクロール
  frontend/src/hooks/useSearch.ts                      # 検索ロジック
  frontend/src/hooks/useDebouncedValue.ts              # デバウンスフック
  frontend/src/hooks/useEventListener.ts               # イベントリスナー重複排除
  frontend/src/hooks/usePassiveScroll.ts               # パッシブスクロールフック
```

---

## フェーズ 5: カテゴリ/タグ + データ構造最適化

**目的**: Map/Set による高速ルックアップ、immutable 配列操作

**新規APIエンドポイント**: `GET/POST /api/categories`, Todo に categoryId 追加

### 対象ルール (9個)
| ルール | 適用箇所 |
|---|---|
| `js-set-map-lookups` | カテゴリIDの Set で O(1) ルックアップ |
| `js-index-maps` | ID→Todo の Map インデックス |
| `js-cache-function-results` | カテゴリフィルタ結果のメモ化 |
| `js-cache-property-access` | ネストプロパティのキャッシュ |
| `js-flatmap-filter` | flatMap で filter+map を1パスに |
| `js-tosorted-immutable` | toSorted() で元配列を変更せずソート |
| `js-min-max-loop` | ループでの min/max 最適化 |
| `server-dedup-props` | API レスポンスの重複排除 |
| `server-serialization` | JSON シリアライズの最適化 |

### ファイル操作
```
新規:
  frontend/src/types/category.ts                     # カテゴリ型定義
  frontend/src/components/category/CategoryList.tsx    # カテゴリ一覧
  frontend/src/components/category/CategoryBadge.tsx   # カテゴリバッジ
  frontend/src/components/category/CategoryPicker.tsx  # カテゴリ選択UI
  frontend/src/hooks/useCategories.ts                  # カテゴリAPI + Map管理
  frontend/src/hooks/useTodosByCategory.ts             # カテゴリ別フィルタ
  frontend/src/lib/collections.ts                      # Map/Set ユーティリティ
  frontend/src/lib/memo.ts                             # 関数結果メモ化ユーティリティ
  backend/internal/model/category.go                   # カテゴリモデル
  backend/internal/handler/category.go                 # カテゴリハンドラ

修正:
  frontend/src/types/todo.ts           # categoryId フィールド追加
  backend/internal/model/todo.go       # CategoryID 追加
  backend/internal/store/store.go      # Category メソッド追加
  backend/internal/store/postgres.go   # categories テーブル追加
  backend/main.go                      # ルート登録
```

---

## フェーズ 6: アクティビティログ + SVG + 表示最適化

**目的**: 長リストの表示最適化、SVGアニメーション、DOM操作バッチ化

**新規APIエンドポイント**: `GET /api/activities`

### 対象ルール (10個)
| ルール | 適用箇所 |
|---|---|
| `rendering-content-visibility` | 長いリストに `content-visibility: auto` |
| `rendering-animate-svg-wrapper` | SVGアニメーションをラッパーdivで実行 |
| `rendering-svg-precision` | SVG座標精度を最適化 |
| `rendering-activity` | Activity API の概念実演 |
| `rendering-hydration-no-flicker` | テーマ初期化のちらつき防止（SPA版） |
| `rendering-hydration-suppress-warning` | suppressHydrationWarning の適用 |
| `js-batch-dom-css` | DOM/CSS操作のバッチ処理 |
| `advanced-event-handler-refs` | イベントハンドラの ref 化 |
| `server-hoist-static-io` | 静的I/Oのモジュールレベル巻き上げ |
| `server-after-nonblocking` | レスポンス後の非同期処理（Go版） |

### ファイル操作
```
新規:
  frontend/src/pages/ActivityPage.tsx                  # アクティビティページ
  frontend/src/components/activity/ActivityLog.tsx      # ログリスト
  frontend/src/components/activity/ActivityItem.tsx     # 個別項目
  frontend/src/components/activity/CompletionAnimation.tsx  # SVGアニメーション
  frontend/src/components/activity/VirtualizedList.tsx  # content-visibility リスト
  frontend/src/hooks/useActivities.ts                  # アクティビティAPI
  frontend/src/hooks/useEventHandlerRef.ts             # イベントハンドラref
  frontend/src/hooks/useBatchDom.ts                    # DOMバッチ化フック
  backend/internal/model/activity.go                   # アクティビティモデル
  backend/internal/handler/activity.go                 # アクティビティハンドラ

修正:
  frontend/src/index.html              # テーマ初期化 inline script
  backend/internal/store/store.go      # Activity メソッド追加
  backend/internal/store/postgres.go   # activities テーブル追加
  backend/main.go                      # ルート登録
```

---

## フェーズ 7: Markdownエディタ + キーボードショートカット + 仕上げ

**目的**: 重量コンポーネントの動的読み込み、キーボードショートカット統合、全体の仕上げ

**追加パッケージ**: `react-markdown`, `@dnd-kit/core`

### 対象ルール (残り 3個 + 既存の強化)
| ルール | 適用箇所 |
|---|---|
| `async-api-routes` | バックエンド API で Promise 即時開始パターン |
| `server-cache-react` | React Query キャッシュ戦略の最適化 |
| `client-swr-dedup` | React Query の重複排除パターン強化 |

### ファイル操作
```
新規:
  frontend/src/components/editor/MarkdownEditor.tsx    # 動的読み込み対象
  frontend/src/components/editor/MarkdownPreview.tsx   # プレビュー表示
  frontend/src/components/shortcuts/KeyboardShortcuts.tsx  # ショートカット管理UI
  frontend/src/hooks/useKeyboardShortcuts.ts           # グローバルショートカット

修正:
  frontend/src/components/todo/TodoItem.tsx            # Markdown説明文対応
  frontend/src/hooks/useTodosApi.ts                    # キャッシュ戦略最適化
```

---

## 全62ルール カバレッジ

| カテゴリ | ルール数 | カバー | フェーズ |
|---|---|---|---|
| 1. Eliminating Waterfalls | 5 | 5/5 | 1, 2 |
| 2. Bundle Size Optimization | 5 | 5/5 | 1 |
| 3. Server-Side Performance | 8 | 8/8 | 2, 3, 5, 6 |
| 4. Client-Side Data Fetching | 4 | 4/4 | 既存, 3, 4 |
| 5. Re-render Optimization | 13 | 13/13 | 既存, 2, 3, 4 |
| 6. Rendering Performance | 11 | 11/11 | 1, 4, 6 |
| 7. JavaScript Performance | 13 | 13/13 | 4, 5, 6 |
| 8. Advanced Patterns | 3 | 3/3 | 3, 6 |
| **合計** | **62** | **62/62** | |

---

## 実装順序と依存関係

```
フェーズ 1 (ルーティング基盤)
    ↓
フェーズ 2 (ダッシュボード)  ← バックエンド拡張必要
    ↓
フェーズ 3 (設定)  ←┐
フェーズ 4 (検索)  ←┘ 並行作業可能
    ↓
フェーズ 5 (カテゴリ) ← Todo モデル拡張
    ↓
フェーズ 6 (アクティビティ)
    ↓
フェーズ 7 (仕上げ)
```

---

## Next.js 固有ルールの代替戦略

server-* ルールは Vite + Go 構成で同等の概念を実装する:

- `server-auth-actions` → Go 認証ミドルウェア
- `server-cache-react` → React Query のキャッシュ戦略
- `server-cache-lru` → Go の LRU キャッシュ
- `server-dedup-props` → API レスポンス最適化
- `server-hoist-static-io` → Go で静的データをモジュールレベルで読み込み
- `server-serialization` → JSON シリアライズ最適化
- `server-parallel-fetching` → Go goroutine で並列クエリ
- `server-after-nonblocking` → Go で goroutine によるレスポンス後処理

hydration 関連ルールは SPA のテーマ初期化 FOUC 防止パターンで代替する。

---

## 検証方法

各フェーズ完了時に以下を確認:
1. `npm run build` が成功すること
2. `npm run lint` がエラーなしで通ること
3. 開発サーバーで全ページが正常に動作すること
4. バックエンド API が正常にレスポンスを返すこと
5. コードコメントに `[ルール名]` が付与されていること
