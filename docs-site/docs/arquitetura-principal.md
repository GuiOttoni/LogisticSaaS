Documento de Arquitetura: OmniDynamic Engine

Versão: 1.0

Status: Definição Técnica

Área: Dynamic Pricing & Global Inventory Systems

1. Visão Geral do Sistema

O OmniDynamic Engine é uma plataforma ultra-escalável projetada para resolver o desafio de precificação dinâmica e gestão de inventário em tempo real para o varejo global. O sistema utiliza uma abordagem poliglota para extrair o máximo de performance de cada stack tecnológica escolhida.

2. Diagrama de Arquitetura Lógica (C4 Model - Nível 2)

O fluxo de dados segue o padrão de Event-Driven Architecture (EDA) e Microservices:

Ingestion Layer (Java): Recebe milhares de eventos/seg via sensores IoT.

Message Backbone (Kafka): Desacopla a ingestão do processamento de estado.

Stateful Processing (.NET): Gerencia a consistência de pedidos e reservas.

High-Performance Solver (C++): Realiza cálculos matemáticos em microsegundos.

BFF & Gateway (Node.js): Orquestra a comunicação externa e segurança.

3. Stack Tecnológica e Justificativa

Componente | Tecnologia | Justificativa
--- | --- | ---
Ingestion | Java 21 (Spring / Loki) | Modelo reativo para I/O não-bloqueante; logs estruturados para Loki.
API Gateway / BFF | Node.js (NestJS) | Desenvolvimento rápido de APIs; ecossistema rico para autenticação JWT e WebSockets.
Pricing Solver | C++ 20 (Drogon Framework) | Latência crítica; controle total sobre gerenciamento de memória e otimização de CPU.
Order Service | .NET 8 (Supabase SDK) | Modelo de Atores + SDK REST para persistência estável.
Catalog Service | .NET 8 (Supabase SDK) | Gestão de produtos via PostgREST nativo.
Frontend | Next.js 14 | SSR para o dashboard administrativo e atualizações em tempo real.

4. Estratégia de Dados (Databases)

Para suportar os diferentes requisitos de cada serviço, adotamos uma estratégia de Polyglot Persistence centralizada no BaaS:

**Supabase (Catalog & Order Services):** Centraliza a persistência relacional. A comunicação via PostgREST (HTTPS) resolve problemas de pool de conexões TCP e oferece segurança nativa via API Key/JWT.

**Redis (Cache de Preços):** Cache de curtíssima duração (TTL `< 5s`) para os preços calculados pelo motor C++, reduzindo a pressão sobre o Solver gRPC.

**MongoDB (Ingestion Layer):** (Opcional/Legacy) Armazenamento de telemetria IoT bruto para análise histórica massiva.

5. Pipeline de CI/CD e Infraestrutura

A infraestrutura é baseada em Kubernetes (K8s) para orquestração e Terraform para IaC.

Pipeline de Entrega (GitHub Actions / GitLab CI):

Static Analysis: Execução de SonarQube e Linter específico para cada linguagem.

Unit & Integration Tests: Testes de contrato via Pact.io para garantir que o gRPC entre Node.js e C++ não quebre.

Containerization: Geração de imagens Docker multi-stage (otimizadas para C++ e Java).

Security Scan: Varredura de vulnerabilidades nas imagens (Trivy/Snyk).

Deployment (Canary Release): Deploy progressivo no cluster K8s usando ArgoCD.

6. Observabilidade e Resiliência

Tratamento de Falhas:

Polly (.NET) & Resilience4j (Java): Implementação de Circuit Breaker para evitar falhas em cascata.

Dead Letter Queues (DLQ): Mensagens do Kafka que falharem após 3 retentativas são movidas para análise.

**Monitoramento de Container:** **cAdvisor** e **Prometheus** coletam métricas de hardware e performance em tempo real.

**Agregação de Logs:** **Loki** e **Promtail** centralizam os logs de todas as linguagens (Java, C#, C++, Node.js) em uma única interface.

**Visualização:** **Grafana** provê dashboards de saúde da infraestrutura e KPIs de negócio.

7. Contratos de Comunicação

O desenvolvimento é Contract-First:

gRPC/ProtoBuf: Define a interface entre o Gateway e o Pricing Solver.

AsyncAPI: Define os esquemas das mensagens trafegadas no Kafka.

OmniDynamic Engine - Arquitetura desenhada para o futuro do varejo autônomo.