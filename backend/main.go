package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/yuita-yoshihiko/front-lesson/backend/internal/handler"
	"github.com/yuita-yoshihiko/front-lesson/backend/internal/store"
)

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = "postgres://todos:todos@localhost:5432/todos?sslmode=disable"
	}

	s, err := store.NewPostgresStore(databaseURL)
	if err != nil {
		log.Fatalf("store.NewPostgresStore: %v", err)
	}

	mux := http.NewServeMux()
	h := handler.NewTodoHandler(s)
	h.RegisterRoutes(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("backend listening on :%s\n", port)
	if err := http.ListenAndServe(":"+port, handler.WithCORS(mux)); err != nil {
		log.Fatalf("ListenAndServe: %v", err)
	}
}
