package handler

import (
	"net/http"

	"github.com/yuita-yoshihiko/front-lesson/backend/internal/store"
)

type ActivityHandler struct {
	store store.Store
}

func NewActivityHandler(s store.Store) *ActivityHandler {
	return &ActivityHandler{store: s}
}

func (h *ActivityHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/activities", h.list)
}

/**
 * [server-after-nonblocking] レスポンス後の非同期処理パターン
 * Go では goroutine でレスポンス送信後に非同期処理（ログ記録等）を実行できる
 * BAD: レスポンス前にログ記録等の副作用処理を行うとレイテンシが増大する
 */
func (h *ActivityHandler) list(w http.ResponseWriter, r *http.Request) {
	activities, err := h.store.ListActivities(r.Context(), 50)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, activities)

	// [server-after-nonblocking] レスポンス送信後に非同期でアクセスログを記録
	go func() {
		// 本番環境ではここでアクセスログをDBやログサービスに記録する
		_ = r.URL.Path // アクセスログ用（モック）
	}()
}
