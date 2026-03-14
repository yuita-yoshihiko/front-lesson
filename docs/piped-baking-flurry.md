# Plan: todo-app モノレポ構成への移行 + Go バックエンド追加

## Context

現在の `todo-app/` は localStorage ベースのスタンドアロン React アプリ。
API 通信を含む「Reactベストプラクティス」のサンプルとして再構成するため、
フロントエンド・バックエンドを分離したモノレポ構成に移行する。

**目的**: TanStack Query + Go REST API を使った実務に近い実装パターンを学習できるサンプルにする。

---

## 最終ディレクトリ構造

```
front-lesson/
├── Makefile                        ← 新規: dev/frontend/backend/db コマンド
├── docker-compose.yml              ← 新規: PostgreSQL コンテナ定義
├── frontend/                       ← git mv todo-app frontend（履歴保持）
│   ├── package.json                ← @tanstack/react-query 追加
│   ├── vite.config.ts              ← proxy 設定 /api → localhost:8080 追加
│   └── src/
│       ├── main.tsx                ← QueryClientProvider でラップ
│       ├── App.tsx                 ← useTodosApi + useFilteredTodos に切り替え
│       ├── lib/
│       │   └── api.ts              ← 新規: API クライアントモジュール
│       ├── hooks/
│       │   ├── useTodos.ts         ← 削除（localStorage ベース旧実装）
│       │   ├── useTodosApi.ts      ← 新規: TanStack Query フック（CRUD + 楽観的更新）
│       │   └── useFilteredTodos.ts ← 新規: フィルタ/カウント計算（クライアントローカル）
│       └── components/todo/
│           ├── TodoList.tsx        ← isLoading / error props 追加
│           └── TodoItem.tsx        ← 楽観的更新中の pending 状態対応（任意）
└── backend/                        ← 新規: Go REST API
    ├── go.mod                      ← Go 1.24、pgx/v5 依存
    ├── go.sum
    ├── main.go
    ├── .env.example                ← DB接続URLのサンプル（.gitignore 対象: .env）
    └── internal/
        ├── model/todo.go           ← Todo struct, CreateTodoRequest, UpdateTodoRequest
        ├── store/
        │   ├── store.go            ← Store interface 定義
        │   └── postgres.go         ← PostgreSQL 実装（database/sql + pgx/v5 driver）
        └── handler/todo.go         ← http.Handler 実装 + CORS ミドルウェア
```

---

## 実装詳細

### インフラ: Docker Compose

**`docker-compose.yml`**:
```yaml
services:
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_DB: todos
      POSTGRES_USER: todos
      POSTGRES_PASSWORD: todos
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

`make db` で起動し、`DATABASE_URL=postgres://todos:todos@localhost:5432/todos?sslmode=disable` で接続する。

---

### Go バックエンド

**使用バージョン**: Go 1.24（`go.mod` に `go 1.24` を指定）

**依存ライブラリ**:
- `github.com/jackc/pgx/v5` — PostgreSQL ドライバ（`database/sql` 互換モードで利用）
- それ以外は標準ライブラリのみ

**エンドポイント**:
| Method | Path | 説明 |
|--------|------|------|
| GET | /api/todos | 全件取得（createdAt 降順） |
| POST | /api/todos | 新規作成 → 201 Created |
| PATCH | /api/todos/{id} | 部分更新（text, completed）→ 200 OK |
| DELETE | /api/todos/{id} | 削除 → 204 No Content |

**設計方針**:
- Go 1.24+ の `net/http` ServeMux（パスパラメータ対応、外部ルーター不要）
- `database/sql` + `pgx/v5` driver でPostgreSQL 接続
- DB起動時に `CREATE TABLE IF NOT EXISTS` で自動マイグレーション（シンプルなサンプル向け）
- `DATABASE_URL` 環境変数で接続先を設定（`.env` ファイル読み込みは `os.Getenv` のみ、外部ライブラリ不要）
- CORS ミドルウェアで `http://localhost:5173` を許可
- UUID は `crypto/rand` で生成（標準ライブラリ完結）
- `UpdateTodoRequest` のフィールドはポインタ型にして null/false を区別

**モデル型**（フロントエンドの `Todo` 型と完全一致）:
```go
type Todo struct {
    ID        string `json:"id"`
    Text      string `json:"text"`
    Completed bool   `json:"completed"`
    CreatedAt int64  `json:"createdAt"` // Unix ミリ秒
}
```

**テーブル定義**（自動作成）:
```sql
CREATE TABLE IF NOT EXISTS todos (
    id         TEXT PRIMARY KEY,
    text       TEXT NOT NULL,
    completed  BOOLEAN NOT NULL DEFAULT false,
    created_at BIGINT NOT NULL
);
```

**Store interface**:
```go
type Store interface {
    List(ctx context.Context) ([]model.Todo, error)
    Create(ctx context.Context, todo model.Todo) error
    Update(ctx context.Context, id string, req model.UpdateTodoRequest) (*model.Todo, error)
    Delete(ctx context.Context, id string) error
}
```

**環境変数**:
```
DATABASE_URL=postgres://todos:todos@localhost:5432/todos?sslmode=disable
PORT=8080
```

---

### フロントエンド変更

**新規: `src/lib/api.ts`**
- 共通 `request<T>()` wrapper（エラーハンドリング込み）
- `todoApi.list()` / `create()` / `update()` / `delete()` エクスポート
- vite proxy `/api → localhost:8080` を経由するため BASE_URL は不要

**新規: `src/hooks/useTodosApi.ts`**
- `useQuery(["todos"], todoApi.list)` でデータ取得
- 追加・トグル・削除すべてに楽観的更新パターンを適用:
  - `onMutate`: キャッシュを即時更新 + previous を保存
  - `onError`: previous でロールバック
  - `onSettled`: `invalidateQueries` でサーバーと同期

**新規: `src/hooks/useFilteredTodos.ts`**
- `todos` 配列と `filter` 状態を受け取り `filteredTodos` と `counts` を返す
- 旧 `useTodos.ts` のフィルタロジックを切り出し（サーバーステートと分離）

**`src/main.tsx` 変更**:
```tsx
<QueryClient defaultOptions={{ queries: { staleTime: 10_000 } }}>
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
</QueryClient>
```

**`vite.config.ts` 変更**:
```ts
server: { proxy: { "/api": "http://localhost:8080" } }
```

---

### Makefile

```makefile
.PHONY: dev frontend backend db db-stop

dev:
	$(MAKE) -j2 frontend backend

frontend:
	cd frontend && npm run dev

backend:
	cd backend && go run ./main.go

db:
	docker compose up -d db

db-stop:
	docker compose down
```

---

## 移行ステップ

1. `feat-monorepo-restructure` ブランチ作成
2. `git mv todo-app frontend` でリネームコミット（履歴保持）
3. `docker-compose.yml` 作成、`make db` で PostgreSQL 起動確認
4. Go バックエンド実装（model → store/postgres → handler → main.go 順）
   - `go mod init` + `go get github.com/jackc/pgx/v5`
   - `backend/.env.example` 作成、`backend/.env` を `.gitignore` に追加
5. `go run ./main.go` + `curl` でバックエンド単体動作確認
6. `frontend` に `@tanstack/react-query` 追加
7. `api.ts` → `useTodosApi.ts` → `useFilteredTodos.ts` を実装
8. `main.tsx`, `App.tsx`, `TodoList.tsx` を更新
9. ルート `Makefile` 追加
10. `make db && make dev` でフル動作確認
11. PR 作成

---

## 検証方法

1. `make db` で PostgreSQL コンテナ起動
2. `make dev` でフロント(5173) + バックエンド(8080) を同時起動
3. ブラウザで `http://localhost:5173` を開く
4. Todo を追加 → API レスポンスが返る前に UI に即時反映されること（楽観的更新）
5. ページリロード後もデータが残っていること（PostgreSQL 永続化）
6. バックエンド停止時にエラーメッセージが表示されること（エラーハンドリング）
7. `curl -X POST http://localhost:8080/api/todos -d '{"text":"test"}' -H 'Content-Type: application/json'` で API 直接確認
8. `docker compose down && docker compose up -d db` でデータが永続化されていることを確認
