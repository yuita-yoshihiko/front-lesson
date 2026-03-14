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
	_, err := s.db.ExecContext(ctx, `
		CREATE TABLE IF NOT EXISTS todos (
			id         TEXT PRIMARY KEY,
			text       TEXT NOT NULL,
			completed  BOOLEAN NOT NULL DEFAULT false,
			created_at BIGINT NOT NULL
		)
	`)
	return err
}

func (s *PostgresStore) List(ctx context.Context) ([]model.Todo, error) {
	rows, err := s.db.QueryContext(ctx,
		`SELECT id, text, completed, created_at FROM todos ORDER BY created_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var todos []model.Todo
	for rows.Next() {
		var t model.Todo
		if err := rows.Scan(&t.ID, &t.Text, &t.Completed, &t.CreatedAt); err != nil {
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
		`INSERT INTO todos (id, text, completed, created_at) VALUES ($1, $2, $3, $4)`,
		todo.ID, todo.Text, todo.Completed, todo.CreatedAt,
	)
	return err
}

func (s *PostgresStore) Update(ctx context.Context, id string, req model.UpdateTodoRequest) (*model.Todo, error) {
	// まず現在の値を取得
	var t model.Todo
	err := s.db.QueryRowContext(ctx,
		`SELECT id, text, completed, created_at FROM todos WHERE id = $1`, id,
	).Scan(&t.ID, &t.Text, &t.Completed, &t.CreatedAt)
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

	_, err = s.db.ExecContext(ctx,
		`UPDATE todos SET text = $1, completed = $2 WHERE id = $3`,
		t.Text, t.Completed, t.ID,
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
