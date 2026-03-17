---
sidebar_position: 3
---

# API Gateway - Endpoints

O Gateway centraliza as chamadas do frontend na porta **3000**.

## 1. Catálogo e Produtos (`/catalog`)

### Listar Produtos
- **Método:** `GET`
- **Rota:** `/catalog/products`
- **Output:** Lista de `ProductDto`.

### Criar Produto
- **Método:** `POST`
- **Rota:** `/catalog/products`
- **Body:** `{ "sku": "...", "name": "...", "base_price": ..., "stock_quantity": ... }`

### Atualizar Estoque
- **Método:** `PUT`
- **Rota:** `/catalog/products/:id/stock`
- **Body:** `{ "changeAmount": 10, "reason": "Restock" }`

---

## 2. Regras de Preço (`/pricing-rules`)
*Protegido por JWT*

### Listar Regras
- **Método:** `GET`
- **Rota:** `/pricing-rules`

### Criar Regra
- **Método:** `POST`
- **Rota:** `/pricing-rules`
- **Body:** `{ "name": "...", "sku_target": "...", "condition": "...", "active": true }`

---

## 3. Monitoramento de Kafka
### Eventos de Stream
- **Método:** `GET`
- **Rota:** `/kafka-stream/events`
- **Descrição:** Traz os últimos eventos processados pela camada de ingestão.
