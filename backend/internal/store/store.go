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
}
