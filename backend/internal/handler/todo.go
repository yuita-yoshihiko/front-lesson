package handler

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"time"

	"github.com/yuita-yoshihiko/front-lesson/backend/internal/model"
	"github.com/yuita-yoshihiko/front-lesson/backend/internal/store"
)

type TodoHandler struct {
	store store.Store
}

func NewTodoHandler(s store.Store) *TodoHandler {
	return &TodoHandler{store: s}
}

func (h *TodoHandler) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("GET /api/todos", h.list)
	mux.HandleFunc("POST /api/todos", h.create)
	mux.HandleFunc("PATCH /api/todos/{id}", h.update)
	mux.HandleFunc("DELETE /api/todos/{id}", h.delete)
}

func (h *TodoHandler) list(w http.ResponseWriter, r *http.Request) {
	todos, err := h.store.List(r.Context())
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusOK, todos)
}

func (h *TodoHandler) create(w http.ResponseWriter, r *http.Request) {
	var req model.CreateTodoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Text == "" {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	todo := model.Todo{
		ID:        newUUID(),
		Text:      req.Text,
		Completed: false,
		CreatedAt: time.Now().UnixMilli(),
	}
	if err := h.store.Create(r.Context(), todo); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	writeJSON(w, http.StatusCreated, todo)

	// [server-after-nonblocking] レスポンス送信後に非同期でアクティビティを記録
	go func() {
		_ = h.store.CreateActivity(r.Context(), model.Activity{
			ID:        newUUID(),
			Action:    "created",
			TodoID:    todo.ID,
			TodoText:  todo.Text,
			CreatedAt: time.Now().UnixMilli(),
		})
	}()
}

func (h *TodoHandler) update(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")

	var req model.UpdateTodoRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	todo, err := h.store.Update(r.Context(), id, req)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if todo == nil {
		http.Error(w, "not found", http.StatusNotFound)
		return
	}
	writeJSON(w, http.StatusOK, todo)

	// [server-after-nonblocking] 完了状態変更時にアクティビティを記録
	if req.Completed != nil {
		go func() {
			action := "uncompleted"
			if *req.Completed {
				action = "completed"
			}
			_ = h.store.CreateActivity(r.Context(), model.Activity{
				ID:        newUUID(),
				Action:    action,
				TodoID:    todo.ID,
				TodoText:  todo.Text,
				CreatedAt: time.Now().UnixMilli(),
			})
		}()
	}
}

func (h *TodoHandler) delete(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	if err := h.store.Delete(r.Context(), id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// CORS ミドルウェア
func WithCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func newUUID() string {
	b := make([]byte, 16)
	rand.Read(b)
	b[6] = (b[6] & 0x0f) | 0x40 // version 4
	b[8] = (b[8] & 0x3f) | 0x80 // variant
	return hex.EncodeToString(b[:4]) + "-" +
		hex.EncodeToString(b[4:6]) + "-" +
		hex.EncodeToString(b[6:8]) + "-" +
		hex.EncodeToString(b[8:10]) + "-" +
		hex.EncodeToString(b[10:])
}
