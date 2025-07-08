.PHONY: infras init

infras:
	docker compose -f infras/docker-compose.yml up -d

init:
	npm run initdb && npm run initdata

users:
	docker compose -f infras/docker-compose.yml exec -T postgres psql -U postgres -d owaspdb -c "SELECT id, username, password, role FROM users ORDER BY id;"

de-infras:
	docker compose -f infras/docker-compose.yml down -v
