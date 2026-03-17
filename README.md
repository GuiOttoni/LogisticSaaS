# OmniDynamic Engine

> Projeto de estudo feito utilizando Antigravity + Gemini 3 Pro
>Tecnologias diversas para os microserviços, aplicações de diversos conceitos como:
> Filas, gRPC, Akka.NET, BFF x Frontend, Observabilidade e etc.

> Ainda em desenvolvimento. Faltando implementações como CQRS, Event Sourcing, Caching, Patterns diferentes e SAGA Pattern

Checklist de implementação:
- [ ] Fazer implementação de saida de estoque
- [ ] Fazer implementação de entrada de estoque
- [ ] Fazer implementação de reserva de estoque
- [ ] Fazer implementação de cancelamento de reserva de estoque
- [ ] Fazer implementação de alteração de reserva de estoque
- [ ] Fazer implementação de alteração de preço
- [ ] Fazer implementação de alteração de estoque

> Plataforma ultra-escalável de **precificação dinâmica** e **gestão de inventário** em tempo real para o varejo global.

## Stack

| Serviço | Tecnologia | Hospedagem |
|--------|-----------|-----------|
| Frontend Control Plane | Next.js 14 | **Vercel** |
| API Gateway / BFF | Node.js (NestJS) | Kubernetes |
| Ingestion Layer | Java 21 (Spring / Loki) | Kubernetes |
| Pricing Solver | C++ 20 (Drogon / gRPC) | Kubernetes |
| Order Service | .NET 8 (Supabase SDK) | Kubernetes |
| Catalog Service | .NET 8 (Supabase SDK) | Kubernetes |
| Banco de Dados | PostgreSQL via **Supabase** | Supabase Cloud |
| Observabilidade | Loki + Prometheus + Grafana | Kubernetes |
| Mensageria | Apache Kafka | Kubernetes |

---

## Estrutura do Monorepo

```
LogisticSaaS/
├── services/
│   ├── frontend/          # Next.js 14 → Vercel
│   ├── gateway/           # NestJS (BFF / API Gateway)
│   ├── ingestion/         # Java 21 / Spring WebFlux
│   ├── pricing-solver/    # C++ 20 / Drogon
│   └── order-service/     # .NET 8 / Akka.NET
├── supabase/
│   ├── migrations/        # SQL DDL por schema
│   └── seed.sql           # Dados de exemplo
├── infra/
│   ├── helm/              # Helm Charts por serviço
│   └── terraform/         # IaC – Cluster Kubernetes
├── .github/
│   └── workflows/         # CI/CD pipelines
├── docker-compose.yml     # Ambiente de desenvolvimento local
└── Makefile               # Comandos comuns
```

---

## Pré-requisitos

```bash
# Ferramentas necessárias
docker & docker-compose
node >= 20.x
java 21 (JDK)
cmake >= 3.20
dotnet sdk 8.x
supabase CLI
kubectl & helm 3.x
terraform >= 1.7
```

## Quickstart (Desenvolvimento Local)

```bash
# 1. Clone e copie variáveis de ambiente
git clone <repo-url>
cp .env.example .env

# 2. Suba todos os serviços via Docker Compose
make dev

# 3. Acesse o Dashboard
open http://localhost:3000

# 4. Aplique as migrations no Supabase
make migrate
```

## Portas de Desenvolvimento

| Serviço | Porta |
|--------|-------|
| Frontend | 3000 |
| Gateway | 3001 |
| Ingestion | 3002 |
| Pricing Solver | 3003 |
| Catalog Service | 3005 |
| Grafana (Dashboards) | 3006 |
| Prometheus | 9090 |
| Loki | 3001 |
| Kafka UI | 8081 |
| Redis Commander | 8082 |
| Supabase Studio | 54323 |

## Comandos Make

```bash
make dev          # Sobe todo o ambiente local
make down         # Para todos os containers
make migrate      # Aplica migrations Supabase
make build-all    # Constrói todas as imagens Docker
make logs         # Streaming de logs de todos os serviços
make test-all     # Executa testes de todos os serviços
```

## Deploy em Produção

```
Frontend  → Vercel (automático via GitHub Actions ao push em main)
Serviços  → Kubernetes via Helm + ArgoCD (ver infra/helm/)
Database  → Supabase Cloud (migrations via CI/CD)
Infra     → Terraform (ver infra/terraform/)
```

---

---

## Próximos Passos / Roadmap

| # | Tarefa | Impacto | Complexidade |
| --- | ------ | ------- | ------------ |
| 1 | **Redis cache no Pricing Solver** — integrar `hiredis` no CMakeLists.txt; cachear resultados de `/calculate` por SKU + regras ativas | Reduz latência P99 | Alta |
| 2 | **RF02 — Backtesting / Sandboxing de regras** — endpoint de simulação que aplica regras sem persistir; UI no Test Lab para comparar cenários | Nova feature | Alta |
| 3 | **RF07 — Auditoria imutável de mudanças de preço** — tabela `price_audit` append-only; logar cada cálculo com regras aplicadas, `base_price`, `final_price`, timestamp | Compliance | Média |
| 4 | **gRPC real Gateway ↔ Pricing Solver** — substituir REST HTTP por gRPC (proto já planejado); reduzir overhead de serialização | Performance | Alta |
| 5 | **Circuit Breakers** — Polly no Order Service (.NET); Resilience4j no Ingestion (Java); fallback para preço base quando Solver indisponível | Resiliência | Média |
| 6 | **Akka.Persistence no Order Service** — persistir estado dos atores no PostgreSQL via `Akka.Persistence.PostgreSql`; sobreviver a restarts | Estado persistente | Média |
| 7 | **RF10 — RBAC** — reativar `@UseGuards(JwtAuthGuard)` nos controllers; implementar roles `admin` / `operator` / `viewer`; proteger endpoints de escrita | Segurança produção | Média |
| 8 | **RF08 complementar — "Reativar tudo"** — botão de reversão do Emergency Stop; reativar todas as regras com um clique após freeze | UX | Baixa |

> Documentação completa: [`arquitetura-togaf.md`](./arquitetura-togaf.md)
