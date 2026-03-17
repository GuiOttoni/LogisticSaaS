Estrutura de Base de Dados: OmniDynamic Engine

O sistema utiliza uma abordagem de Polyglot Persistence para otimizar a performance de cada microsserviço conforme definido nos requisitos não-funcionais (RNF).

1. Telemetria e Ingestão (MongoDB)

Microsserviço: Java Spring WebFlux (Ingestion Layer)

Justificativa: Alta vazão de escrita para sensores IoT e eventos WMS sem esquema rígido.

Coleção: inventory_telemetry

Armazena o fluxo bruto de atualizações de stock.

```json
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
```


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
| conditions | JSONB | Condições (Ex: `{"stock_level": "<10%", "competitor_price": "any"}`). |
| action_logic | JSONB | Lógica de cálculo (Ex: `{"type": "markup", "value": 0.15}`). |
| priority | INTEGER | Ordem de execução para conflitos. |
| is_active | BOOLEAN | Estado da regra. |

3. Gestão de Pedidos e Inventário (PostgreSQL via Supabase SDK)

Microsserviço: .NET 8 (Order Service)

Justificativa: Persistência resiliente via PostgREST (HTTPS/REST) usando o **Supabase C# SDK**, eliminando instabilidades de conexão TCP/PgBouncer em redes conteinerizadas.

Tabela: order_events (Event Store)
Registo imutável de todas as transações de cada ator.
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | BIGSERIAL (PK) | Sequencial para ordenação de eventos. |
| aggregate_id | UUID | ID da Reserva/Pedido (identificador do Ator). |
| event_type | VARCHAR(50) | 'RESERVATION_CREATED', 'STOCK_LOCKED', 'ORDER_PAID'. |
| payload | JSONB | Dados do evento no momento do disparo. |
| version | INTEGER | Versão do estado do ator para concorrência otimista. |
| created_at | TIMESTAMPTZ | Timestamp de alta precisão. |

4. Catálogo e SKU (PostgreSQL via Supabase SDK)

Microsserviço: .NET 8 (Catalog Service)

Justificativa: Gestão de mestre de produtos e trilha de auditoria de estoque utilizando mapeamento direto de modelos para PostgREST.

Tabela: products
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID (PK) | ID único do produto. |
| sku | VARCHAR(100) | SKU único do produto. |
| name | VARCHAR(255) | Nome amigável. |
| base_price | NUMERIC | Preço base de cálculo. |
| stock_quantity | INTEGER | Saldo atual em estoque. |

Tabela: stock_audit
Histórico de movimentações para auditoria (US05).

5. Cache de Alta Performance (Redis)
... (mantido conforme original)
