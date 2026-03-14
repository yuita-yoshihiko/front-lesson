# Todoアプリ実装計画

## Context

`todo-app/` はshadcn/ui + Tailwind CSS v4 + React 19 + Viteが設定済みのフロントエンドプロジェクト。現在はbutton.tsxのみ存在し、App.tsxはテスト用の最小実装。バックエンドなし・LocalStorage永続化のシンプルなTodoアプリを実装する。

## 機能要件

1. Todo追加（テキスト入力 + 追加ボタン、Enterキー送信対応）
2. Todo一覧表示
3. 完了/未完了の切り替え（チェックボックス）
4. Todo削除
5. フィルタリング（全て / 未完了 / 完了済み）
6. LocalStorageでデータ永続化

## ファイル構成

```
todo-app/src/
├── types/
│   └── todo.ts                  # [新規] Todo型定義
├── hooks/
│   └── useTodos.ts              # [新規] Todoロジック + LocalStorage
├── components/
│   ├── ui/
│   │   ├── button.tsx           # [既存]
│   │   ├── input.tsx            # [新規・shadcn add]
│   │   └── checkbox.tsx         # [新規・shadcn add]
│   └── todo/
│       ├── TodoForm.tsx         # [新規] 入力フォーム
│       ├── TodoItem.tsx         # [新規] 1件の行
│       ├── TodoList.tsx         # [新規] 一覧表示
│       └── TodoFilter.tsx       # [新規] フィルタータブ
└── App.tsx                      # [変更] 全体レイアウト
```

## 型定義（src/types/todo.ts）

```typescript
export type FilterType = "all" | "active" | "completed"

export interface Todo {
  id: string        // crypto.randomUUID()
  text: string
  completed: boolean
  createdAt: number // Date.now()
}
```

## カスタムフック（src/hooks/useTodos.ts）

```typescript
const STORAGE_KEY = "todos-v1"

// 初期値をLocalStorageから読み込み
const [todos, setTodos] = useState<Todo[]>(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch { return [] }
})

// todos変化時にLocalStorage同期
useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}, [todos])

// filteredTodos, countsはuseMemoで計算
```

返却値: `{ todos, filter, filteredTodos, counts, addTodo, toggleTodo, deleteTodo, setFilter }`

## コンポーネント設計

| コンポーネント | props | 主な使用shadcn |
|---|---|---|
| `App` | なし | — |
| `TodoForm` | `onAdd: (text: string) => void` | Input, Button |
| `TodoFilter` | `current`, `onChange`, `counts` | Button (variant切替) |
| `TodoList` | `todos`, `onToggle`, `onDelete` | — |
| `TodoItem` | `todo`, `onToggle`, `onDelete` | Checkbox, Button(ghost/icon) |

**TodoItem** のスタイル: 完了済みテキストに `line-through text-muted-foreground`（`cn()` で条件分岐）、削除ボタンに lucide-react の `Trash2` アイコン。

## 実装手順

1. `npx shadcn@latest add input checkbox`
2. `src/types/todo.ts` 作成
3. `src/hooks/useTodos.ts` 作成
4. `src/components/todo/TodoItem.tsx` 作成
5. `src/components/todo/TodoList.tsx` 作成
6. `src/components/todo/TodoForm.tsx` 作成
7. `src/components/todo/TodoFilter.tsx` 作成
8. `src/App.tsx` 全面書き換え

## 参照ファイル

- `todo-app/src/components/ui/button.tsx` - variant/sizeパターン
- `todo-app/src/lib/utils.ts` - `cn()` 関数
- `todo-app/src/index.css` - CSS変数（`--muted-foreground`, `--border`等）

## 検証方法

1. `cd todo-app && npm run dev` で開発サーバー起動
2. ブラウザでTodo追加・完了切り替え・削除・フィルタ動作確認
3. ページリロード後もLocalStorageからデータが復元されることを確認
4. `npm run build` でTypeScriptエラーがないことを確認
