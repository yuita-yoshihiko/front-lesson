package store

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	_ "github.com/jackc/pgx/v5/stdlib"

	"github.com/yuita-yoshihiko/front-lesson/backend/internal/model"
)

type PostgresStore struct {
	db *sql.DB
}

func NewPostgresStore(databaseURL string) (*PostgresStore, error) {
	db, err := sql.Open("pgx", databaseURL)
	if err != nil {
		return nil, fmt.Errorf("sql.Open: %w", err)
	}
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("db.Ping: %w", err)
	}
	s := &PostgresStore{db: db}
	if err := s.migrate(context.Background()); err != nil {
		return nil, fmt.Errorf("migrate: %w", err)
	}
	return s, nil
}

func (s *PostgresStore) migrate(ctx context.Context) error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS categories (
			id   TEXT PRIMARY KEY,
			name TEXT NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS todos (
			id          TEXT PRIMARY KEY,
			text        TEXT NOT NULL,
			completed   BOOLEAN NOT NULL DEFAULT false,
			created_at  BIGINT NOT NULL,
			category_id TEXT NOT NULL DEFAULT ''
		)`,
		// category_id カラムが存在しない場合に追加（既存テーブル対応）
		`DO $$ BEGIN
			ALTER TABLE todos ADD COLUMN IF NOT EXISTS category_id TEXT NOT NULL DEFAULT '';
		EXCEPTION WHEN others THEN NULL;
		END $$`,
		`CREATE TABLE IF NOT EXISTS activities (
			id         TEXT PRIMARY KEY,
			action     TEXT NOT NULL,
			todo_id    TEXT NOT NULL,
			todo_text  TEXT NOT NULL,
			created_at BIGINT NOT NULL
		)`,
	}
	for _, q := range queries {
		if _, err := s.db.ExecContext(ctx, q); err != nil {
			return err
		}
	}
	return nil
}

func (s *PostgresStore) List(ctx context.Context) ([]model.Todo, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, text, completed, created_at, category_id FROM todos ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var todos []model.Todo
	for rows.Next() {
		var t model.Todo
		if err := rows.Scan(&t.ID, &t.Text, &t.Completed, &t.CreatedAt, &t.CategoryID); err != nil {
			return nil, err
		}
		todos = append(todos, t)
	}
	if todos == nil {
		todos = []model.Todo{}
	}
	return todos, rows.Err()
}

func (s *PostgresStore) Create(ctx context.Context, todo model.Todo) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO todos (id, text, completed, created_at, category_id) VALUES ($1, $2, $3, $4, $5)`,
		todo.ID, todo.Text, todo.Completed, todo.CreatedAt, todo.CategoryID,
	)
	return err
}

func (s *PostgresStore) Update(ctx context.Context, id string, req model.UpdateTodoRequest) (*model.Todo, error) {
	var t model.Todo
	err := s.db.QueryRowContext(ctx,
		`SELECT id, text, completed, created_at, category_id FROM todos WHERE id = $1`, id,
	).Scan(&t.ID, &t.Text, &t.Completed, &t.CreatedAt, &t.CategoryID)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	if req.Text != nil {
		t.Text = *req.Text
	}
	if req.Completed != nil {
		t.Completed = *req.Completed
	}
	if req.CategoryID != nil {
		t.CategoryID = *req.CategoryID
	}

	_, err = s.db.ExecContext(ctx,
		`UPDATE todos SET text = $1, completed = $2, category_id = $3 WHERE id = $4`,
		t.Text, t.Completed, t.CategoryID, t.ID,
	)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (s *PostgresStore) Delete(ctx context.Context, id string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM todos WHERE id = $1`, id)
	return err
}

func (s *PostgresStore) CountAll(ctx context.Context) (int, error) {
	var count int
	err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM todos`).Scan(&count)
	return count, err
}

func (s *PostgresStore) CountCompleted(ctx context.Context) (int, error) {
	var count int
	err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM todos WHERE completed = true`).Scan(&count)
	return count, err
}

func (s *PostgresStore) Recent(ctx context.Context, limit int) ([]model.Todo, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, text, completed, created_at, category_id FROM todos ORDER BY created_at DESC LIMIT $1`, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var todos []model.Todo
	for rows.Next() {
		var t model.Todo
		if err := rows.Scan(&t.ID, &t.Text, &t.Completed, &t.CreatedAt, &t.CategoryID); err != nil {
			return nil, err
		}
		todos = append(todos, t)
	}
	if todos == nil {
		todos = []model.Todo{}
	}
	return todos, rows.Err()
}

// Category 系メソッド

func (s *PostgresStore) ListCategories(ctx context.Context) ([]model.Category, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, name FROM categories ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []model.Category
	for rows.Next() {
		var c model.Category
		if err := rows.Scan(&c.ID, &c.Name); err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}
	if categories == nil {
		categories = []model.Category{}
	}
	return categories, rows.Err()
}

func (s *PostgresStore) CreateCategory(ctx context.Context, cat model.Category) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO categories (id, name) VALUES ($1, $2)`,
		cat.ID, cat.Name,
	)
	return err
}

func (s *PostgresStore) DeleteCategory(ctx context.Context, id string) error {
	// カテゴリ削除時に関連するTodoのcategory_idをクリア
	_, _ = s.db.ExecContext(ctx, `UPDATE todos SET category_id = '' WHERE category_id = $1`, id)
	_, err := s.db.ExecContext(ctx, `DELETE FROM categories WHERE id = $1`, id)
	return err
}

// Activity 系メソッド

func (s *PostgresStore) ListActivities(ctx context.Context, limit int) ([]model.Activity, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, action, todo_id, todo_text, created_at FROM activities ORDER BY created_at DESC LIMIT $1`, limit,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var activities []model.Activity
	for rows.Next() {
		var a model.Activity
		if err := rows.Scan(&a.ID, &a.Action, &a.TodoID, &a.TodoText, &a.CreatedAt); err != nil {
			return nil, err
		}
		activities = append(activities, a)
	}
	if activities == nil {
		activities = []model.Activity{}
	}
	return activities, rows.Err()
}

func (s *PostgresStore) CreateActivity(ctx context.Context, activity model.Activity) error {
	_, err := s.db.ExecContext(ctx,
		`INSERT INTO activities (id, action, todo_id, todo_text, created_at) VALUES ($1, $2, $3, $4, $5)`,
		activity.ID, activity.Action, activity.TodoID, activity.TodoText, activity.CreatedAt,
	)
	return err
}
