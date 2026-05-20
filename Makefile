.PHONY: help install dev build test lint clean deploy docker-up docker-down

help:
	@echo "ZenCode AI - Development Commands"
	@echo "=================================="
	@echo "make install    - Install dependencies"
	@echo "make dev        - Start development server"
	@echo "make build      - Build for production"
	@echo "make start      - Start production server"
	@echo "make test       - Run tests"
	@echo "make lint       - Run linter"
	@echo "make format     - Format code"
	@echo "make clean      - Clean build files"
	@echo "make docker-up  - Start Docker containers"
	@echo "make docker-down - Stop Docker containers"
	@echo "make migrate    - Run database migrations"

install:
	pnpm install

dev:
	pnpm dev

build:
	pnpm build && pnpm build:server

start:
	node server/dist/index.js

test:
	pnpm test

test-watch:
	pnpm test --watch

coverage:
	pnpm test --coverage

lint:
	pnpm lint

lint-fix:
	pnpm lint --fix

format:
	pnpm format

clean:
	rm -rf .next dist server/dist node_modules coverage

docker-build:
	docker build -t zencode-ai:latest .

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f app

docker-clean:
	docker-compose down -v

migrate:
	pnpm migrate

seed:
	pnpm seed

analyze:
	pnpm analyze

# Git helpers
git-push:
	git push origin main

git-push-dev:
	git push origin develop

git-tag-release:
	@read -p "Enter version (e.g., 1.0.0): " version; \
	git tag -a v$$version -m "Release v$$version"; \
	git push origin v$$version

# Development workflow
setup: install docker-up migrate
	@echo "Setup complete!"

reset: clean docker-clean
	@echo "Reset complete!"

full-clean: clean docker-clean
	rm -rf .env.local
	@echo "Full clean complete!"
