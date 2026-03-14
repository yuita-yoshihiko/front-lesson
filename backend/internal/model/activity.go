package model

// Activity はTodoの操作履歴
type Activity struct {
	ID        string `json:"id"`
	Action    string `json:"action"`    // "created", "completed", "deleted"
	TodoID    string `json:"todoId"`
	TodoText  string `json:"todoText"`
	CreatedAt int64  `json:"createdAt"` // Unix ミリ秒
}
