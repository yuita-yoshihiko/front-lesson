package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/yuita-yoshihiko/front-lesson/backend/internal/handler"
	"github.com/yuita-yoshihiko/front-lesson/backend/internal/store"
)

/**
 * [server-hoist-static-io] 静的な設定値をモジュールレベルで読み込む
 * リクエストごとに環境変数を読み取るのではなく、起動時に一度だけ読み込む
 * BAD: ハンドラ内で毎回 os.Getenv() を呼ぶと無駄なシステムコールが発生する
 */
var (
	defaultDatabaseURL = "postgres://todos:todos@localhost:5432/todos?sslmode=disable"
	defaultPort        = "8080"
)

func main() {
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		databaseURL = defaultDatabaseURL
	}

	s, err := store.NewPostgresStore(databaseURL)
	if err != nil {
		log.Fatalf("store.NewPostgresStore: %v", err)
	}

	mux := http.NewServeMux()
	h := handler.NewTodoHandler(s)
	h.RegisterRoutes(mux)

	sh := handler.NewStatsHandler(s)
	sh.RegisterRoutes(mux)

	ch := handler.NewCategoryHandler(s)
	ch.RegisterRoutes(mux)

	ah := handler.NewActivityHandler(s)
	ah.RegisterRoutes(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}

	fmt.Printf("backend listening on :%s\n", port)
	if err := http.ListenAndServe(":"+port, handler.WithCORS(mux)); err != nil {
		log.Fatalf("ListenAndServe: %v", err)
	}
}
