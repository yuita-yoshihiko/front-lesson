# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

このリポジトリはフロントエンド学習用プロジェクトで、`todo-app/` ディレクトリにメインアプリが存在する。

```
front-lesson/
└── todo-app/          # メインアプリ（Vite + React + TypeScript）
    ├── src/
    │   ├── components/ui/   # shadcn/ui コンポーネント
    │   ├── lib/utils.ts     # cn() ユーティリティ
    │   ├── App.tsx
    │   └── index.css        # CSS変数によるテーマ定義
    └── package.json
```

## Commands

すべてのコマンドは `todo-app/` ディレクトリで実行する。

```bash
cd todo-app

npm run dev       # 開発サーバー起動
npm run build     # TypeScript チェック + Vite ビルド
npm run lint      # ESLint
npm run preview   # ビルド結果のプレビュー
```

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (ビルドツール)
- **Tailwind CSS v4** (`@import 'tailwindcss'` 形式)
- **shadcn/ui** コンポーネント（`src/components/ui/` に配置）
- **Radix UI** プリミティブ（`radix-ui` パッケージ）
- **class-variance-authority (cva)** でコンポーネントバリアント管理
- **clsx + tailwind-merge** → `cn()` 関数（`src/lib/utils.ts`）
- **lucide-react** アイコン
- **Geist Variable** フォント

## Architecture Notes

### shadcn/ui の利用方法
- コンポーネントは `src/components/ui/` に配置される
- `cva()` でバリアント定義、`cn()` でクラス結合するパターンを踏襲する
- `asChild` パターンは `Slot.Root`（`radix-ui` パッケージ）を使用

### CSS テーマ
- `src/index.css` に CSS カスタムプロパティ（`--background`, `--primary` 等）でテーマ定義
- ダークモードは `.dark` クラスで切り替え
- Tailwind v4 の `@theme inline` ブロックで CSS 変数をテーマトークンに紐付け

### パスエイリアス
- `@/` は `src/` にマップされている（例: `@/components/ui/button`, `@/lib/utils`）
