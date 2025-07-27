.PHONY: infras init test-all test-a01 test-a03 test-a04 test-a07 test-sequential

infras:
	docker compose -f infras/docker-compose.yml up -d
	PowerShell -Command "Start-Sleep -Seconds 5"
	npm run initdb
	npm run initdata

users:
	docker compose -f infras/docker-compose.yml exec -T postgres psql -U postgres -d owaspdb -c "SELECT id, username, password, failed_attempts, locked_until, role FROM users ORDER BY id;"

de-infras:
	docker compose -f infras/docker-compose.yml down -v

# Playwright test commands for OWASP vulnerabilities
test:
	npm run test

test-a01:
	npm run test:a01

test-a03:
	npm run test:a03

test-a04:
	npm run test:a04

test-a07:
	npm run test:a07

test-sequential:
	npm run test:sequential
