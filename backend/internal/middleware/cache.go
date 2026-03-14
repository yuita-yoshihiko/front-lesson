package middleware

import (
	"container/list"
	"net/http"
	"sync"
	"time"
)

/**
 * [server-cache-lru] LRU キャッシュミドルウェア
 * 最近使用されたレスポンスをメモリにキャッシュし、DBアクセスを削減する
 * キャパシティを超えた場合、最も古いエントリを自動的に削除する
 */

type cacheEntry struct {
	key       string
	body      []byte
	status    int
	headers   http.Header
	expiresAt time.Time
}

// LRUCache はスレッドセーフな LRU キャッシュ
type LRUCache struct {
	mu       sync.RWMutex
	capacity int
	ttl      time.Duration
	items    map[string]*list.Element
	order    *list.List
}

func NewLRUCache(capacity int, ttl time.Duration) *LRUCache {
	return &LRUCache{
		capacity: capacity,
		ttl:      ttl,
		items:    make(map[string]*list.Element),
		order:    list.New(),
	}
}

func (c *LRUCache) Get(key string) (*cacheEntry, bool) {
	c.mu.RLock()
	elem, ok := c.items[key]
	c.mu.RUnlock()
	if !ok {
		return nil, false
	}
	entry := elem.Value.(*cacheEntry)
	if time.Now().After(entry.expiresAt) {
		c.mu.Lock()
		c.order.Remove(elem)
		delete(c.items, key)
		c.mu.Unlock()
		return nil, false
	}
	c.mu.Lock()
	c.order.MoveToFront(elem)
	c.mu.Unlock()
	return entry, true
}

func (c *LRUCache) Set(key string, entry *cacheEntry) {
	c.mu.Lock()
	defer c.mu.Unlock()

	if elem, ok := c.items[key]; ok {
		c.order.MoveToFront(elem)
		elem.Value = entry
		return
	}

	if c.order.Len() >= c.capacity {
		oldest := c.order.Back()
		if oldest != nil {
			c.order.Remove(oldest)
			delete(c.items, oldest.Value.(*cacheEntry).key)
		}
	}

	entry.expiresAt = time.Now().Add(c.ttl)
	elem := c.order.PushFront(entry)
	c.items[key] = elem
}

// Invalidate はキャッシュを全てクリアする
func (c *LRUCache) Invalidate() {
	c.mu.Lock()
	defer c.mu.Unlock()
	c.items = make(map[string]*list.Element)
	c.order.Init()
}

type responseRecorder struct {
	http.ResponseWriter
	status int
	body   []byte
}

func (r *responseRecorder) WriteHeader(code int) {
	r.status = code
	r.ResponseWriter.WriteHeader(code)
}

func (r *responseRecorder) Write(b []byte) (int, error) {
	r.body = append(r.body, b...)
	return r.ResponseWriter.Write(b)
}

// WithCache は GET リクエストのレスポンスをキャッシュするミドルウェア
func WithCache(cache *LRUCache) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet {
				// 書き込みリクエストでキャッシュをクリア
				cache.Invalidate()
				next.ServeHTTP(w, r)
				return
			}

			key := r.URL.String()
			if entry, ok := cache.Get(key); ok {
				for k, v := range entry.headers {
					w.Header()[k] = v
				}
				w.WriteHeader(entry.status)
				w.Write(entry.body)
				return
			}

			rec := &responseRecorder{ResponseWriter: w, status: http.StatusOK}
			next.ServeHTTP(rec, r)

			if rec.status == http.StatusOK {
				cache.Set(key, &cacheEntry{
					key:     key,
					body:    rec.body,
					status:  rec.status,
					headers: w.Header().Clone(),
				})
			}
		})
	}
}
