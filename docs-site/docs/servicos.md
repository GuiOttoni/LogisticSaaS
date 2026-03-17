---
sidebar_position: 1
---

# Catálogo de Serviços

O OmniDynamic Engine é composto por microserviços especializados de alta performance.

## 1. Ingestion Layer (Java)
- **Tecnologia:** Java 21, Spring WebFlux, Loki.
- **Responsabilidade:** Ingestão massiva de telemetria IoT. Recebe eventos de sensores via HTTP/Webhook e publica em tópicos assíncronos (Kafka).
- **Portas:** 8080 (Interna).

## 2. API Gateway / BFF (Node.js)
- **Tecnologia:** NestJS, JWT, Swagger.
- **Responsabilidade:** Ponto de entrada único para o Frontend. Realiza orquestração entre serviços internos, autenticação e agrega respostas das APIs internas.
- **Portas:** 3000 (Externa).

## 3. Pricing Solver (C++)
- **Tecnologia:** C++ 20, Drogon Framework, gRPC.
- **Responsabilidade:** Motor matemático de precificação. Calcula atualizações de preço em tempo real baseadas em algoritmos complexos. P99 `< 15ms`.
- **Portas:** 3002 (gRPC).

## 4. Order Service (.NET)
- **Tecnologia:** .NET 8, Akka.NET (Atores), Supabase SDK.
- **Responsabilidade:** Gestão transacional de pedidos e reservas de estoque. Garante consistência via persistência no Supabase.
- **Portas:** 3001.

## 5. Catalog Service (.NET)
- **Tecnologia:** .NET 8, Supabase SDK.
- **Responsabilidade:** Mestre de produtos (SKU) e trilha de auditoria de estoque.
- **Portas:** 3003.

## 6. Frontend Lab (Next.js)
- **Tecnologia:** React 18, Next.js 14, Tailwind CSS.
- **Responsabilidade:** Interface administrativa para analistas de preços e monitoramento operacional.
- **Portas:** 3005.
