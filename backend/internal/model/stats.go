package model

// Stats はダッシュボード用の統計データ
type Stats struct {
	Total     int     `json:"total"`
	Active    int     `json:"active"`
	Completed int     `json:"completed"`
	Rate      float64 `json:"rate"` // 完了率 (0.0〜1.0)
}
