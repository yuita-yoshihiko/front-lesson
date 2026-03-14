.PHONY: dev frontend backend db db-stop

dev:
	$(MAKE) -j2 frontend backend

frontend:
	cd frontend && npm run dev

backend:
	cd backend && go run ./main.go

db:
	docker compose up -d db

db-stop:
	docker compose down
