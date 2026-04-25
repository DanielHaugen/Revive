DOCKER_DB = docker exec -i postgres
PSQL = $(DOCKER_DB) psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

# Load .env variables
include .env
export

# ── ANSI Colors ──────────────────────────────────────────
RESET   := \033[0m
BOLD    := \033[1m
DIM     := \033[2m

BLACK   := \033[30m
RED     := \033[31m
GREEN   := \033[32m
YELLOW  := \033[33m
BLUE    := \033[34m
MAGENTA := \033[35m
CYAN    := \033[36m
WHITE   := \033[37m

# Bright variants
BRED    := \033[91m
BGREEN  := \033[92m
BYELLOW := \033[93m
BBLUE   := \033[94m
BCYAN   := \033[96m
BWHITE  := \033[97m

# Semantic aliases
INFO    := $(BBLUE)
SUCCESS := $(BGREEN)
WARN    := $(BYELLOW)
ERROR   := $(BRED)
HEADER  := $(BOLD)$(BCYAN)
LABEL   := $(BOLD)$(BWHITE)
MUTED   := $(DIM)$(WHITE)

# ── Docker Compose ───────────────────────────────────────

## Start all services (detached)
.PHONY: up
up:
	@echo "$(INFO)Starting services...$(RESET)"
	docker compose up -d
	@echo "$(SUCCESS)Services started.$(RESET)"

## Build images and start all services (detached)
.PHONY: up-build
up-build:
	@echo "$(INFO)Building and starting services...$(RESET)"
	docker compose up -d --build
	@echo "$(SUCCESS)Services started.$(RESET)"

## Stop all services
.PHONY: down
down:
	@echo "$(INFO)Stopping services...$(RESET)"
	docker compose down
	@echo "$(SUCCESS)Services stopped.$(RESET)"

## Stop all services and remove volumes (destructive!)
.PHONY: down-v
down-v:
	@echo "$(ERROR)$(BOLD)WARNING: This will remove all volumes including the database!$(RESET)"
	docker compose down -v
	@echo "$(SUCCESS)Services stopped and volumes removed.$(RESET)"

## Restart all services
.PHONY: restart
restart:
	@echo "$(INFO)Restarting services...$(RESET)"
	docker compose restart
	@echo "$(SUCCESS)Services restarted.$(RESET)"

## Build images without starting
.PHONY: build
build:
	@echo "$(INFO)Building images...$(RESET)"
	docker compose build
	@echo "$(SUCCESS)Build complete.$(RESET)"

## Show status of running containers
.PHONY: ps
ps:
	docker compose ps

## Tail logs for all services (or SERVICE=name for one)
.PHONY: logs
logs:
	docker compose logs -f $(SERVICE)

## Open a shell in the app container
.PHONY: shell
shell:
	docker exec -it nextjs_app sh

# ── Helpers ──────────────────────────────────────────────

## Open an interactive psql shell
.PHONY: db-shell
db-shell:
	docker exec -it postgres psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

## Run an arbitrary SQL query: make db-query SQL="SELECT 1"
.PHONY: db-query
db-query:
	@$(PSQL) -c "$(SQL)"

# ── Users ────────────────────────────────────────────────

## List all registered users
.PHONY: db-users
db-users:
	@$(PSQL) -c 'SELECT id, email, "firstName", "lastName", "createdAt" FROM "User" ORDER BY id;'

## Count registered users
.PHONY: db-user-count
db-user-count:
	@$(PSQL) -c 'SELECT COUNT(*) AS total_users FROM "User";'

## Find a user by email: make db-user-find EMAIL=user@example.com
.PHONY: db-user-find
db-user-find:
ifndef EMAIL
	$(error Usage: make db-user-find EMAIL=user@example.com)
endif
	@$(PSQL) -c "SELECT id, email, \"firstName\", \"lastName\", \"createdAt\" FROM \"User\" WHERE email = '$(EMAIL)';"

## Delete a user by email: make db-user-delete EMAIL=user@example.com
.PHONY: db-user-delete
db-user-delete:
ifndef EMAIL
	$(error Usage: make db-user-delete EMAIL=user@example.com)
endif
	@$(PSQL) -c "DELETE FROM \"User\" WHERE email = '$(EMAIL)';"
	@echo "$(WARN)Deleted user:$(RESET) $(EMAIL)"

# ── Playbooks ────────────────────────────────────────────

## List all playbooks
.PHONY: db-playbooks
db-playbooks:
	@$(PSQL) -c 'SELECT id, name, description, starred FROM "Playbook" ORDER BY id;'

## Show playbook details with steps and targets: make db-playbook ID=1
.PHONY: db-playbook
db-playbook:
ifndef ID
	$(error Usage: make db-playbook ID=<playbook_id>)
endif
	@$(PSQL) -c "SELECT p.id, p.name, s.id AS step_id, s.type, t.\"instanceId\", t.\"instanceName\", t.\"snapshotId\" FROM \"Playbook\" p LEFT JOIN \"Step\" s ON s.\"playbookId\" = p.id LEFT JOIN \"Target\" t ON t.\"stepId\" = s.id WHERE p.id = $(ID) ORDER BY s.id, t.id;"

# ── Tables ───────────────────────────────────────────────

## List all tables
.PHONY: db-tables
db-tables:
	@$(PSQL) -c "\dt"

## Describe a table: make db-describe TABLE=User
.PHONY: db-describe
db-describe:
ifndef TABLE
	$(error Usage: make db-describe TABLE=User)
endif
	@$(PSQL) -c '\d "$(TABLE)"'

# ── Prisma ───────────────────────────────────────────────

## Run prisma migrate in the app container
.PHONY: db-migrate
db-migrate:
	@echo "$(INFO)Running Prisma migrations...$(RESET)"
	docker exec nextjs_app npx prisma migrate dev
	@echo "$(SUCCESS)Migrations applied.$(RESET)"

## Reset the database (destructive!)
.PHONY: db-reset
db-reset:
	@echo "$(ERROR)$(BOLD)WARNING: This will destroy all data in the database!$(RESET)"
	docker exec nextjs_app npx prisma migrate reset --force
	@echo "$(SUCCESS)Database reset complete.$(RESET)"

## Seed the database
.PHONY: db-seed
db-seed:
	@echo "$(INFO)Seeding database...$(RESET)"
	docker exec nextjs_app npx prisma db seed
	@echo "$(SUCCESS)Seed complete.$(RESET)"

# ── Help ─────────────────────────────────────────────────

## Show available commands
.PHONY: help
help:
	@echo ""
	@echo "$(HEADER)╔══════════════════════════════════════════════╗$(RESET)"
	@echo "$(HEADER)║         Revive — Database Debug CLI          ║$(RESET)"
	@echo "$(HEADER)╚══════════════════════════════════════════════╝$(RESET)"
	@echo ""
	@echo "$(LABEL)  Docker Compose$(RESET)"
	@echo "$(MUTED)  ──────────────────────────────────────────────$(RESET)"
	@echo "  $(CYAN)make up$(RESET)                      Start all services"
	@echo "  $(CYAN)make up-build$(RESET)                Build and start all services"
	@echo "  $(CYAN)make down$(RESET)                    Stop all services"
	@echo "  $(CYAN)make down-v$(RESET)                  $(ERROR)Stop + remove volumes$(RESET)"
	@echo "  $(CYAN)make restart$(RESET)                 Restart all services"
	@echo "  $(CYAN)make build$(RESET)                   Build images"
	@echo "  $(CYAN)make ps$(RESET)                      Show container status"
	@echo "  $(CYAN)make logs$(RESET) $(MUTED)[SERVICE=name]$(RESET)    Tail service logs"
	@echo "  $(CYAN)make shell$(RESET)                   Shell into app container"
	@echo ""
	@echo "$(LABEL)  Helpers$(RESET)"
	@echo "$(MUTED)  ──────────────────────────────────────────────$(RESET)"
	@echo "  $(CYAN)make db-shell$(RESET)                Open psql shell"
	@echo "  $(CYAN)make db-query$(RESET) $(MUTED)SQL=\"...\"$(RESET)       Run arbitrary SQL"
	@echo ""
	@echo "$(LABEL)  Users$(RESET)"
	@echo "$(MUTED)  ──────────────────────────────────────────────$(RESET)"
	@echo "  $(CYAN)make db-users$(RESET)                List all users"
	@echo "  $(CYAN)make db-user-count$(RESET)           Count users"
	@echo "  $(CYAN)make db-user-find$(RESET) $(MUTED)EMAIL=...$(RESET)    Find user by email"
	@echo "  $(CYAN)make db-user-delete$(RESET) $(MUTED)EMAIL=...$(RESET)  $(WARN)Delete user by email$(RESET)"
	@echo ""
	@echo "$(LABEL)  Playbooks$(RESET)"
	@echo "$(MUTED)  ──────────────────────────────────────────────$(RESET)"
	@echo "  $(CYAN)make db-playbooks$(RESET)            List all playbooks"
	@echo "  $(CYAN)make db-playbook$(RESET) $(MUTED)ID=...$(RESET)        Show playbook details"
	@echo ""
	@echo "$(LABEL)  Tables$(RESET)"
	@echo "$(MUTED)  ──────────────────────────────────────────────$(RESET)"
	@echo "  $(CYAN)make db-tables$(RESET)               List all tables"
	@echo "  $(CYAN)make db-describe$(RESET) $(MUTED)TABLE=...$(RESET)     Describe a table"
	@echo ""
	@echo "$(LABEL)  Prisma$(RESET)"
	@echo "$(MUTED)  ──────────────────────────────────────────────$(RESET)"
	@echo "  $(CYAN)make db-migrate$(RESET)              Run prisma migrate"
	@echo "  $(CYAN)make db-seed$(RESET)                 Seed the database"
	@echo "  $(CYAN)make db-reset$(RESET)                $(ERROR)Reset DB — destructive$(RESET)"
	@echo ""

.DEFAULT_GOAL := help
