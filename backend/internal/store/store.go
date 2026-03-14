package store

import (
	"context"

	"github.com/yuita-yoshihiko/front-lesson/backend/internal/model"
)

type Store interface {
	List(ctx context.Context) ([]model.Todo, error)
	Create(ctx context.Context, todo model.Todo) error
	Update(ctx context.Context, id string, req model.UpdateTodoRequest) (*model.Todo, error)
	Delete(ctx context.Context, id string) error

	// Stats 系メソッド（フェーズ2）
	CountAll(ctx context.Context) (int, error)
	CountCompleted(ctx context.Context) (int, error)
	Recent(ctx context.Context, limit int) ([]model.Todo, error)

	// Category 系メソッド（フェーズ5）
	ListCategories(ctx context.Context) ([]model.Category, error)
	CreateCategory(ctx context.Context, cat model.Category) error
	DeleteCategory(ctx context.Context, id string) error

	// Activity 系メソッド（フェーズ6）
	ListActivities(ctx context.Context, limit int) ([]model.Activity, error)
	CreateActivity(ctx context.Context, activity model.Activity) error
}
