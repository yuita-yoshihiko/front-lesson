package model

// Todo はフロントエンドの Todo 型と JSON キーが完全一致する
type Todo struct {
	ID         string `json:"id"`
	Text       string `json:"text"`
	Completed  bool   `json:"completed"`
	CreatedAt  int64  `json:"createdAt"`  // Unix ミリ秒
	CategoryID string `json:"categoryId"` // 空文字列 = カテゴリなし
}

type CreateTodoRequest struct {
	Text string `json:"text"`
}

// UpdateTodoRequest のフィールドはポインタ型にして null と false/空文字を区別する
type UpdateTodoRequest struct {
	Text       *string `json:"text"`
	Completed  *bool   `json:"completed"`
	CategoryID *string `json:"categoryId"`
}
