package handler

import (
	"encoding/json"
	"net/http"

	"github.com/yuita-yoshihiko/front-lesson/backend/internal/model"
	"github.com/yuita-yoshihiko/front-lesson/backend/internal/store"
)

type CategoryHandler struct {
	store store.Store
}

func NewCategoryHandler(s store.Store) *CategoryHandler {
	return &CategoryHandler{store: s}
}

func (h *CategoryHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/categories", h.list)
	mux.HandleFunc("POST /api/categories", h.create)
	mux.HandleFunc("DELETE /api/categories/{id}", h.delete)
}

func (h *CategoryHandler) list(w http.ResponseWriter, r *http.Request) {
	/**
	 * [server-dedup-props] APIレスポンスの重複排除
	 * カテゴリ一覧はIDで一意なので重複は発生しないが、
	 * 将来的にタグの結合クエリで重複が発生する可能性に備えてパターンを示す
	 */
	categories, err := h.store.ListCategories(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	/**
	 * [server-serialization] JSONシリアライズの最適化
	 * 空配列の場合は [] を返し、null を返さない
	 */
	writeJSON(w, http.StatusOK, categories)
}

func (h *CategoryHandler) create(w http.ResponseWriter, r *http.Request) {
	var req model.CreateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Name == "" {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	cat := model.Category{
		ID:   newUUID(),
		Name: req.Name,
	}
	if err := h.store.CreateCategory(r.Context(), cat); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusCreated, cat)
}

func (h *CategoryHandler) delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.store.DeleteCategory(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
