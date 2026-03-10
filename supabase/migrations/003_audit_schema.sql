-- =============================================================================
-- Migration 003: Audit Schema
-- Immutable price change log for compliance and regulatory auditing (US05 / RF07)
-- Schema: audit
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS audit.price_change_logs (
    id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    sku_id     VARCHAR(100) NOT NULL,
    old_price  DECIMAL(15,2) NOT NULL,
    new_price  DECIMAL(15,2) NOT NULL,
    rule_id    UUID REFERENCES pricing.pricing_rules(id) ON DELETE SET NULL,
    reason     TEXT,
    triggered_by VARCHAR(20) NOT NULL DEFAULT 'SOLVER', -- SOLVER | MANUAL | SCHEDULED
    created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for fast export per SKU (audit use-case)
CREATE INDEX IF NOT EXISTS idx_price_logs_sku_created
    ON audit.price_change_logs (sku_id, created_at DESC);

-- Row Level Security
ALTER TABLE audit.price_change_logs ENABLE ROW LEVEL SECURITY;

-- Auditors can read; only service-role can write
CREATE POLICY "price_logs_read"
    ON audit.price_change_logs FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "price_logs_write"
    ON audit.price_change_logs FOR INSERT
    TO service_role
    WITH CHECK (TRUE);
