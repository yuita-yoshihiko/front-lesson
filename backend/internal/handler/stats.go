package handler

import (
	"net/http"
	"sync"

	"github.com/yuita-yoshihiko/front-lesson/backend/internal/model"
	"github.com/yuita-yoshihiko/front-lesson/backend/internal/store"
)

type StatsHandler struct {
	store store.Store
}

func NewStatsHandler(s store.Store) *StatsHandler {
	return &StatsHandler{store: s}
}

func (h *StatsHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/stats", h.stats)
	mux.HandleFunc("GET /api/todos/recent", h.recent)
}

/**
 * [server-parallel-fetching] goroutine で統計クエリを並列実行
 * 複数の独立したDBクエリを同時に実行し、レスポンスタイムを短縮する
 * BAD: 直列にクエリを実行すると合計レイテンシが増大する
 */
func (h *StatsHandler) stats(w http.ResponseWriter, r *http.Request) {
	var (
		wg        sync.WaitGroup
		total     int
		completed int
		fetchErr  error
	)

	wg.Add(2)

	// goroutine 1: 全件数
	go func() {
		defer wg.Done()
		count, err := h.store.CountAll(r.Context())
		if err != nil {
			fetchErr = err
			return
		}
		total = count
	}()

	// goroutine 2: 完了件数
	go func() {
		defer wg.Done()
		count, err := h.store.CountCompleted(r.Context())
		if err != nil {
			fetchErr = err
			return
		}
		completed = count
	}()

	wg.Wait()

	if fetchErr != nil {
		http.Error(w, fetchErr.Error(), http.StatusInternalServerError)
		return
	}

	active := total - completed
	var rate float64
	if total > 0 {
		rate = float64(completed) / float64(total)
	}

	writeJSON(w, http.StatusOK, model.Stats{
		Total:     total,
		Active:    active,
		Completed: completed,
		Rate:      rate,
	})
}

func (h *StatsHandler) recent(w http.ResponseWriter, r *http.Request) {
	todos, err := h.store.Recent(r.Context(), 5)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, todos)
}
