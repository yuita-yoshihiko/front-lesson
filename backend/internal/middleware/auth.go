package middleware

import (
	"net/http"
	"strings"
)

/**
 * [server-auth-actions] 認証ミドルウェア雛形
 * リクエストの Authorization ヘッダーを検証し、認証されたリクエストのみ通過させる
 * 本番環境ではJWT検証やセッション検証に置き換える
 */

// WithAuth は Bearer トークンを検証する認証ミドルウェア（雛形）
func WithAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// 開発環境では認証をスキップ
		// 本番環境ではこのフラグを環境変数で制御する
		authHeader := r.Header.Get("Authorization")

		// Authorization ヘッダーが空の場合はスキップ（開発モード）
		if authHeader == "" {
			next.ServeHTTP(w, r)
			return
		}

		// Bearer トークンの形式を検証
		if !strings.HasPrefix(authHeader, "Bearer ") {
			http.Error(w, "invalid authorization header", http.StatusUnauthorized)
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")
		if token == "" {
			http.Error(w, "missing token", http.StatusUnauthorized)
			return
		}

		// TODO: 本番環境では JWT 検証を実装する
		// claims, err := validateJWT(token)
		// if err != nil { ... }

		next.ServeHTTP(w, r)
	})
}
