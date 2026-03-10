Estrutura de Base de Dados: OmniDynamic Engine

O sistema utiliza uma abordagem de Polyglot Persistence para otimizar a performance de cada microsserviço conforme definido nos requisitos não-funcionais (RNF).

1. Telemetria e Ingestão (MongoDB)

Microsserviço: Java Spring WebFlux (Ingestion Layer)

Justificativa: Alta vazão de escrita para sensores IoT e eventos WMS sem esquema rígido.

Coleção: inventory_telemetry

Armazena o fluxo bruto de atualizações de stock.

{
  "_id": "ObjectId",
  "sku_id": "STRING (Index)",
  "warehouse_id": "STRING (Index)",
  "event_type": "ENUM [check_in, check_out, movement, physical_count]",
  "quantity_delta": "NUMBER",
  "metadata": {
    "sensor_id": "STRING",
    "accuracy": "FLOAT",
    "batch_id": "STRING"
  },
  "timestamp": "ISODate"
}


2. Regras de Precificação (PostgreSQL - Schema: pricing)

Microsserviço: Node.js (Gateway/BFF) & C++ (Pricing Solver)

Justificativa: Relacional para garantir integridade referencial nas configurações.

Tabela: pricing_rules (RF01 / US01)

Define os gatilhos que o Solver C++ irá processar.
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID (PK) | Identificador único da regra. |
| name | VARCHAR(255) | Nome descritivo da estratégia. |
| target_scope | ENUM | 'GLOBAL', 'CATEGORY', 'SKU', 'REGION'. |
| target_id | VARCHAR(100) | ID do alvo (ex: Categoria "Eletro"). |
| conditions | JSONB | Condições (Ex: {"stock_level": "<10%", "competitor_price": "any"}). |
| action_logic | JSONB | Lógica de cálculo (Ex: {"type": "markup", "value": 0.15}). |
| priority | INTEGER | Ordem de execução para conflitos. |
| is_active | BOOLEAN | Estado da regra. |

3. Gestão de Pedidos e Inventário (PostgreSQL - Schema: orders)

Microsserviço: .NET 8 (Akka.NET)

Justificativa: Suporte a Event Sourcing e consistência ACID para transações financeiras.

Tabela: order_events (Event Store - RF03 / US04)

Registo imutável de todas as transações de cada ator.
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | BIGSERIAL (PK) | Sequencial para ordenação de eventos. |
| aggregate_id | UUID | ID da Reserva/Pedido (identificador do Ator). |
| event_type | VARCHAR(50) | 'RESERVATION_CREATED', 'STOCK_LOCKED', 'ORDER_PAID'. |
| payload | JSONB | Dados do evento no momento do disparo. |
| version | INTEGER | Versão do estado do ator para concorrência otimista. |
| created_at | TIMESTAMPTZ | Timestamp de alta precisão. |

Tabela: inventory_snapshot (Read Model)

Estado atualizado "achatado" para consultas rápidas do Dashboard.

sku_id (PK), total_reserved, total_available, last_update.

4. Auditoria e Compliance (PostgreSQL - Schema: audit)

Microsserviço: Shared / Node.js

Justificativa: Atender à US05 (Log de Auditoria).

Tabela: price_change_logs

Coluna

Tipo

Descrição

id

UUID (PK)

Identificador do log.

sku_id

VARCHAR(100)

SKU afetado.

old_price

DECIMAL(15,2)

Preço antes da alteração.

new_price

DECIMAL(15,2)

Preço após a alteração.

rule_id

UUID (FK)

Regra que disparou a alteração.

reason

TEXT

Motivo gerado pelo Solver (ex: "Low stock trigger").

timestamp

TIMESTAMPTZ

Data e hora exacta.

5. Cache de Alta Performance (Redis)

Microsserviço: C++ Pricing Solver & Node.js Gateway

Justificativa: Acesso sub-milissegundo para o checkout.

Key: price:{sku_id}:{region_id}

Value: decimal_price (TTL: 5-30s)

Key: inventory_lock:{sku_id}:{order_id}

Value: timestamp (TTL: 15m - US04)