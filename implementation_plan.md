# OmniDynamic Integration & Catalog Service

The goal of this phase is to expand the system to include a dedicated Product/Catalog service in .NET 8, wire up a live test page in the Frontend, formally connect to Supabase for persistence, and update architecture documents. The Gateway was previously failing due to a missing `SUPABASE_URL`, which we will fix concurrently.

## Proposed Changes

### Phase 1: Database & Environment Fixes
To resolve the NestJS Gateway crash and prepare for the new service:
- **Supabase Integration**: Retrieve the Supabase credentials (URL and anon/service keys). Configure them in the [docker-compose.yml](file:///f:/Projetos/LogisticSaaS/docker-compose.yml) environment blocks.
- **Database Schema**: 
  - Create a `products` table (id, sku, name, base_price, stock_quantity, created_at) in Supabase.
  - Create a `stock_audit` table to log movements.

### Phase 2: Catalog Service (.NET 8 Minimal API)
Create a new microservice responsible for inventory and product management.
- **Brainstormed Functionalities**:
  1. CRUD for Products (Register new, Edit details).
  2. Stock adjustments (Increment, Decrement, Set exact value).
  3. Base price updates (which notifies the pricing-solver or updates DB).
  4. Audit logging of all stock/price changes.
- **Implementation**:
  - Located at `services/catalog-service`.
  - Built with .NET 8 Minimal API, using Entity Framework Core (or Dapper) for Supabase PostgreSQL connection.
  - Exposes REST endpoints (`POST /api/products`, `PUT /api/products/{id}/stock`, etc.).
- **Docker Compose**: Add `catalog-service` to the cluster network.

### Phase 3: Gateway Integration (NestJS)
The frontend never talks to `catalog-service` directly.
-# Implementação da Stack de Observabilidade Local, Refatoração e Migração para Supabase SDK

A fim de criar um ambiente de 'Test Lab' completo com observabilidade total, implementamos ferramentas de tracing em todos os containers e migramos as dependências de roteamento com sucesso. Em sequência, devido a limitações de IPv6 e proxy no cluster PostgreSQL do Supabase via EF Core Local (Windows Docker Desktop), estamos pivotando os microservices C# para usarem oficialmente o Supabase SDK (REST/PostgREST).

## ⚠️ User Review Required

> [!WARNING]
> Migrar de `Npgsql + Entity Framework Core` para `supabase-csharp` significa **remover o DbContext** e toda a estrutura de transações SQL nativas. O Supabase C# Client usa chamadas REST HTTP (PostgREST) por baixo dos panos ao invés de conexões TPC direto no banco. Isso resolve de vez os erros de *"Tenant or user not found"* no Network Bridge do Docker, mas exige reescrever os métodos CRUD (MapGet, MapPost, etc) nos serviços de Order e Catalog. Podemos seguir e arrancar o EF Core?

## Proposed Changes

### Microservices (.NET)
Adoção do Supabase C# Client em detrimento do Npgsql.

#### [MODIFY] /services/catalog-service/catalog-service.csproj
- Adição da biblioteca `supabase-csharp`.
- Remoção do `Npgsql.EntityFrameworkCore.PostgreSQL`.

#### [MODIFY] /services/catalog-service/Program.cs
- Substituição de `builder.Services.AddDbContext(...)` para injeção via Singleton do `Supabase.Client`.
- Refatoração dos métodos nas rotas `/api/products` para usar a sintaxe local de `await supabase.From<Product>().Get()`, adaptando os controllers CRUD.

#### [MODIFY] /services/catalog-service/Product.cs (e demais models)
- Os Models deverão herdar de `Supabase.Postgrest.Models.BaseModel` e possuir anotações `[Table("Products")]` e `[PrimaryKey("id", false)]` nativas da SDK.

(Processo será repetido na Order Service subsequentemente)

### Infraestrutura
Ajuste nas injeções limpas de variável de ambiente.

#### [MODIFY] docker-compose.yml
- Remoção da string pesada de ADO Npgsql.
- Injeção das chaves nativas REST do arquivo base `.env`.

#### [MODIFY] .env
- Manter apenas `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` e remover as DB String antigas.

## Verification Plan

### Automated Tests
* Rodar `docker-compose up -d --build` após as reestruturações C#.
* Acompanhar os logs do `.NET` verificando inicialização verde sem exceptions com PostgreSQL.

### Manual Verification
* Acessar o frontend na tela de Produtos e submeter criação e listagem para garantir que a SDK PostgREST via API Rest do Supabase trafegou as rotas corretamente.
