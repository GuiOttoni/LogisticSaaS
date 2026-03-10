# OmniDynamic Engine - Documentação TOGAF e Arquitetura

Este documento consolida a arquitetura do projeto **OmniDynamic Engine** seguindo os preceitos do framework TOGAF, bem como os diagramas C4 e UML representativos. Toda a documentação foi baseada nas fontes e requisitos originais, atualizada com as decisões arquiteturais mais recentes.

---

## 1. Visão da Arquitetura (Fase A - Architecture Vision)

**Objetivo Central:** 
Prover uma plataforma ultra-escalável capaz de resolver o desafio de precificação dinâmica e gestão de inventário em tempo real para o varejo global. O sistema toma decisões preditivas e adapta preços em milissegundos.

**Stakeholders Principais:**
- **Analista de Preços:** Configura lógicas de alteração e regras.
- **Gestor Comercial:** Simula estratégias de impactos financeiros.
- **Engenheiro de SRE:** Monitora infraestrutura global e latência crítica (P99).
- **Auditor de Compliance:** Fiscaliza histórico de transações e precificação justificada.
- **Desenvolvedor do E-commerce:** Utiliza APIs para prover os preços finais e reservar estoque em tempo real.

---

## 2. Arquitetura de Negócios (Fase B - Business Architecture)

O fluxo de negócio está focado na automação de processos inteligentes baseados em IoT (WMS/ERP) para a ponta do consumidor final (plataforma e-commerce).

**Capacidades Principais de Negócio:**
1. **Precificação Dinâmica:** O sistema avalia estoques e ações de concorrentes e, de forma não impeditiva, altera percentuais de lucro sob regras booleanas compostas (**RF01**).
2. **Impacto e Simulação (Sandboxing):** Validação segura (backtesting) de novas configurações sem afetar o faturamento da empresa em produção (**RF02 / US02**).
3. **Gerenciamento de Inventário Omnichannel:** Recebe ingestão massiva de armazéns (WMS) e trava estoques temporariamente (TTL) por cada requisição de checkout para não frustrar o consumidor final (**RF04, RF05, RF06**).
4. **Trilhas de Auditoria Regulatória:** Registro fiel imutável do ciclo de vida das mudanças, indicando exatamente quando, como e o motivo de uma flutuação (>50%) ser aceita pelo sistema (**RF07, RF11**).

---

## 3. Arquitetura de Sistemas de Informação (Fase C - Information Systems Architecture)

### 3.1 Arquitetura de Aplicação (Application Architecture)

A lógica de aplicação distribui componentes visando a extração máxima de performance. 
- **API Gateway / BFF (Node.js/NestJS):** Orquestra tráfego externo, lida com segredos, WebSockets e autenticação HTTP segura.
- **Ingestion Layer (Java 21 / Spring WebFlux):** Escuta de forma assíncrona todas as batidas e eventos do IoT. Não bloqueante por natureza. 
- **Pricing Solver (C++ 20 / Drogon):** Algoritmo de performance extrema projetado para rodar os cálculos matemáticos e entregar respostas em <15ms.
- **Order Service (.NET 8 / Akka.NET):** Emprega *Modelo de Atores* que possibilita manipular memória transacional do estado sem forçar travas simultâneas agressivas nos bancos de dados, gerindo o "Stock locked".
- **Dashboard Institucional & Control Plane:** Realizado em **Next.js 14**.

### 3.2 Arquitetura de Dados (Data Architecture)

Todas as áreas convergem para um back-end robusto, com a substituição das ramificações isoladas do banco de dados relacional para o **Supabase** centralizado (postgreSQL as a service):
- **O Supabase como SOT (Source of Truth):** Abriga as `pricing_rules`, guarda os logs no esquema `audit` (`price_change_logs`), e manipula os relatórios achatados do CQRS de `inventory_snapshot`. 
- **Message Backbone (Apache Kafka):** Garante buffer e roteamento (Pub/Sub AsyncAPI) do excesso global da ingestão para que o banco não colapse nas janelas críticas.
- **Cache Layer (Redis):** Gerencia locks otimistas curtos (`inventory_lock:{sku}`) e provê a cópia do cálculo final (`price:{sku_id}`) por segundos limitados (TTL 5s) à borda.

---

## 4. Arquitetura Tecnológica (Fase D - Technology Architecture)

A infraestrutura foi desenhada para a era Cloud-Native:
- **Hospedagem Front-end:** O Dashboard em Next.js e seus server-components/SSR são servidos através da **Vercel**, aproveitando CDNs otimizadas.
- **BaaS e Database:** **Supabase**, lidando com dados persistentes PostgreSQL, atuando como core da infraestrutura relacional, suprindo a camada *Realtime* nativamente quando necessário para as views de analistas.
- **Orquestração de Microserviços:** Todos os microserviços (Java, C++, .NET e Node.js) serão conteinerizados via Docker Image Layers e emparelhados e gerenciados no ecossistema do **Kubernetes (K8s)**. O K8s lidará com *Horizontal Pod Autoscaling (HPA)*, isolando gargalos, e proverá *network policies* para o limite dos *Services*. Ferramentas de CI/CD aplicam manifestos do K8s ou via *Helm/ArgoCD*.

---

## 5. Diagramas C4

Para carregar estes diagramas nativamente em repositórios Markdown, utilizamos Mermaid:

### 5.1 Diagrama de Contexto (C4 Nível 1)
```mermaid
C4Context
    title Contexto de Sistema - OmniDynamic Engine

    Person(analyst, "Analista/Gestor", "Configura e simula regras de preço e estoque")
    System(omnidynamic, "OmniDynamic Engine", "Plataforma central de precificação e inventário omnichannel")
    
    System_Ext(iot_sensors, "Sensores IoT & WMS", "Enviam leitura massiva de estoque e entrada")
    System_Ext(ecommerce, "E-commerce App", "Consulta preços finais e reserva checkout")

    Rel(analyst, omnidynamic, "Visualiza painel analítico e imputa regras")
    Rel(iot_sensors, omnidynamic, "Dispara eventos e logs físicos")
    Rel(omnidynamic, ecommerce, "Provê precificação justa e bloqueio pontual")
    Rel(ecommerce, omnidynamic, "Realiza requisições HTTP seguras e GraphQL")
```

### 5.2 Diagrama de Contêiners (C4 Nível 2)
```mermaid
C4Container
    title Contêineres de Solução e Tecnologias

    Person(user, "Equipe Interna", "Analistas, SREs e Gerentes")
    
    System_Boundary(c1, "Cluster Kubernetes") {
        Container(gateway, "API Gateway / BFF", "Node.js (NestJS)", "Exposição segura, WebSocket, autenticação JWT.")
        Container(ingestion, "Ingestion Layer", "Java 21", "Modelo reativo WebFlux suportando alto I/O externo.")
        Container(solver, "Pricing Solver", "C++ 20 (Drogon)", "Microsegundos de latência em cálculos financeiros.")
        Container(order_sys, "Order Service", ".NET 8 (Akka)", "Gerenciamento de Atores que representam reserva e compra.")
    }

    Container(frontend, "Frontend Control Plane", "Next.js (Vercel)", "Dashboard administrativo SSR reativo.")
    ContainerDb(supabase, "Data Cloud", "Supabase", "Repositório relacional mestre das operações (PostgreSQL).")
    ContainerDb(kafka, "Event Backbone", "Apache Kafka", "Broker distribuído contendo streams de dados e ações de IoT.")
    ContainerDb(redis, "Fast Cache Layer", "Servidor Redis", "Cache na memória p/ tabelas temporárias com base em chaves únicas.")

    Rel(user, frontend, "Acessa via Browser HTTPS")
    Rel(frontend, gateway, "Usa APIs de negócio")
    
    Rel(gateway, solver, "Solicita precificação (gRPC)")
    Rel(gateway, order_sys, "Comunicação Order/Checkout")
    Rel(gateway, supabase, "Gerencia perfis/auditoria CRM diretamente")

    Rel(ingestion, kafka, "Produz logs em streaming")
    Rel(solver, kafka, "Consome métricas p/ recalculo ágil")
    Rel(order_sys, kafka, "Gerador de Action-Requests de fila")

    Rel(solver, supabase, "Consulta logs, atualiza preço calculado nas tabelas mestre")
    Rel(solver, redis, "Atribui cache no TLL (5s) das precificações lógicas")
    Rel(order_sys, supabase, "Submete eventos atômicos dos Atores (.NET)")
```

---

## 6. Diagramas UML

### 6.1 Diagrama de Classe (Domínio de Dados)
Representação orientada a objetos das entidades que fluem de dentro do **Supabase** e Atores.

```mermaid
classDiagram
    class PricingRule {
        +UUID id
        +String name
        +Enum target_scope
        +String target_id
        +JSONB conditions
        +JSONB action_logic
        +Integer priority
        +Boolean is_active
        +save()
        +validateTrigger()
    }
    
    class InventoryTelemetry {
        +String sku_id
        +String warehouse_id
        +Enum event_type
        +Float quantity_delta
        +Date timestamp
    }
    
    class OrderEvent {
        +UUID aggregate_id
        +String event_type
        +JSONB payload
        +Integer version
        +Date created_at
    }
    
    class PriceChangeLog {
        +UUID id
        +String sku_id
        +Decimal old_price
        +Decimal new_price
        +String reason
        +Date timestamp
    }
    
    PricingRule "1" -- "*" PriceChangeLog : Dispara >
    OrderEvent "*" -- "1" InventoryTelemetry : Consolida >
```

### 6.2 Diagrama de Sequência (Recalculo Baseado no Status de Inventário)
Demonstrando o isolamento entre K8s Backend Services atuando no Supabase.

```mermaid
sequenceDiagram
    participant IOT as Sensor IoT / WMS
    participant INGEST as Ingestion (Java)
    participant KAFKA as Message Broker
    participant SOLVER as Pricing Solver (C++)
    participant REDIS as Redis Cache
    participant SUPA as Supabase Database

    IOT->>INGEST: POST /webhook/telemetry
    INGEST->>KAFKA: Publica (Stock Event) no Tópico Assíncrono
    KAFKA-->>SOLVER: Notifica Solver sobre queda brusca de SKU
    SOLVER->>SUPA: SELECT PricingRule WHERE target=SKU
    SUPA-->>SOLVER: Retorna Array com Lógica Operacional JSONB
    SOLVER->>SOLVER: Multiplica e calcula valor para inflacionar (Markup %+)
    SOLVER->>REDIS: SET price_cache com novo Preço (TTL curto p/ concorrência)
    SOLVER->>SUPA: INSERT em PriceChangeLog justificando margem (Audit)
```
