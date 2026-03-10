.PHONY: dev down logs migrate build-all test-all

# ============================
# Development
# ============================

dev:
	@echo "▶ Starting OmniDynamic Engine local environment..."
	docker compose up -d
	@echo "✅ Services started. Dashboard at http://localhost:3000"

down:
	docker compose down --remove-orphans

logs:
	docker compose logs -f

restart:
	docker compose restart

# ============================
# Database
# ============================

migrate:
	@echo "▶ Applying Supabase migrations..."
	cd supabase && supabase db push
	@echo "✅ Migrations applied."

studio:
	cd supabase && supabase start
	@echo "✅ Supabase Studio at http://localhost:54323"

# ============================
# Build
# ============================

build-all:
	@echo "▶ Building all Docker images..."
	docker build -t omnidynamic/gateway:local ./services/gateway
	docker build -t omnidynamic/ingestion:local ./services/ingestion
	docker build -t omnidynamic/pricing-solver:local ./services/pricing-solver
	docker build -t omnidynamic/order-service:local ./services/order-service
	@echo "✅ All images built."

# ============================
# Tests
# ============================

test-all:
	@echo "▶ Running all service tests..."
	cd services/gateway && npm test
	cd services/ingestion && mvn test -q
	cd services/order-service && dotnet test
	@echo "✅ All tests completed."

# ============================
# Deploy (Kubernetes / Helm)
# ============================

helm-deploy:
	@echo "▶ Deploying all Helm charts to K8s..."
	helm upgrade --install omnidynamic-gateway ./infra/helm/gateway -n $(K8S_NAMESPACE) --create-namespace
	helm upgrade --install omnidynamic-ingestion ./infra/helm/ingestion -n $(K8S_NAMESPACE)
	helm upgrade --install omnidynamic-solver ./infra/helm/pricing-solver -n $(K8S_NAMESPACE)
	helm upgrade --install omnidynamic-orders ./infra/helm/order-service -n $(K8S_NAMESPACE)
	@echo "✅ All charts deployed."

K8S_NAMESPACE ?= omnidynamic

# ============================
# Terraform
# ============================

tf-init:
	cd infra/terraform && terraform init

tf-plan:
	cd infra/terraform && terraform plan -out=tfplan

tf-apply:
	cd infra/terraform && terraform apply tfplan
