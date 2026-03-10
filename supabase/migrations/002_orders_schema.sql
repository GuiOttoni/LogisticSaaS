-- =============================================================================
-- Migration 002: Orders Schema
-- Creates order_events (Event Store for Akka.NET) and inventory_snapshot
-- (CQRS Read Model for the NestJS Gateway dashboard view).
-- Schema: orders
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS orders;

-- Event Store - immutable log of every Akka actor state transition
CREATE TABLE IF NOT EXISTS orders.order_events (
    id            BIGSERIAL    PRIMARY KEY,
    aggregate_id  UUID         NOT NULL,   -- order / reservation ID
    event_type    VARCHAR(50)  NOT NULL,   -- RESERVATION_CREATED | STOCK_LOCKED | ORDER_PAID
    payload       JSONB        NOT NULL DEFAULT '{}',
    version       INTEGER      NOT NULL DEFAULT 1,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_events_aggregate
    ON orders.order_events (aggregate_id, version);

-- Read Model - flattened current inventory state for fast dashboard queries
CREATE TABLE IF NOT EXISTS orders.inventory_snapshot (
    sku_id           VARCHAR(100) PRIMARY KEY,
    total_reserved   INTEGER      NOT NULL DEFAULT 0,
    total_available  INTEGER      NOT NULL DEFAULT 0,
    last_update      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE orders.order_events       ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders.inventory_snapshot ENABLE ROW LEVEL SECURITY;

CREATE POLICY "order_events_service_role"
    ON orders.order_events FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY "inventory_snapshot_read"
    ON orders.inventory_snapshot FOR SELECT TO authenticated, anon USING (TRUE);

CREATE POLICY "inventory_snapshot_write"
    ON orders.inventory_snapshot FOR ALL TO service_role USING (TRUE) WITH CHECK (TRUE);
