---
sidebar_position: 2
---

# Fluxo de Conexões

O diagrama abaixo ilustra como os microserviços interagem entre si, utilizando o **API Gateway** como mediador de tráfego externo e o **Message Broker** para desacoplamento assíncrono.

```mermaid
graph LR
    User([Usuário/Analista]) --> FE[Frontend Lab]
    FE --> GW[API Gateway]
    
    subgraph "Internal Backend"
        GW --> PR[Pricing Solver]
        GW --> OR[Order Service]
        GW --> CT[Catalog Service]
    end
    
    subgraph "Infrastructure"
        IOT[Sensor IoT] --> IN[Ingestion Layer]
        IN --> KF[(Kafka)]
        KF --> PR
        OR --> SB[(Supabase)]
        CT --> SB
        PR --> RD[(Redis)]
    end
    
    subgraph "Observability"
        IN & GW & OR & CT --> PM[Promtail]
        PM --> LK[Loki]
        LK --> GF[Grafana]
        PM -- Metrics --> PRO[Prometheus]
        PRO --> GF
    end
```

### Detalhes de Integração
- **HTTP/REST (Swagger):** Entre Gateway e serviços internos (Catalog/Order).
- **gRPC:** Comunicação ultra rápida entre Gateway e Pricing Solver.
- **AMQP/Kafka:** Entrega de eventos de telemetria IoT.
- **REST/HTTPS:** Serviços C# falando diretamente com o Supabase via SDK nativo.
