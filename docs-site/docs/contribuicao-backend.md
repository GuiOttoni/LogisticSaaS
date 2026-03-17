---
sidebar_position: 4
---

# Guia de Contribuição - Backend

O ecossistema é poliglota por design para extrair o melhor de cada runtime.

## 1. Padrões de Código
- **C# / .NET:** Siga os padrões do Microsoft Clean Code. Use o **Supabase C# SDK** para novas persistências. Adote o modelo de atores no Order Service apenas para estados transacionais rápidos.
- **Node.js / NestJS:** Utilize Controllers e Services desacoplados. Todas as novas APIs devem ser registradas no Swagger.
- **Java / Spring:** Mantenha o foco em programação reativa (WebFlux) para evitar bloqueio de threads na ingestão.
- **C++:** Gerenciamento rigoroso de memória. Prefira tipos modernos do C++20.

## 2. CI/CD e Contêineres
- Todos os serviços devem possuir um `Dockerfile` multi-stage.
- Alterações em schemas de banco de dados devem ser feitas via **Supabase SQL Editor** ou Migrations documentadas.

## 3. Observabilidade
- Novas logs devem ser enviadas via Serilog/NLog configurados para rotear para o **Loki**.
- Métricas críticas devem exportar no formato Prometheus.
