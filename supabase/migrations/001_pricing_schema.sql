-- =============================================================================
-- Migration 001: Pricing Schema
-- Creates the pricing_rules table used by the C++ Pricing Solver via the
-- NestJS Gateway. Schema: pricing
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS pricing;

CREATE TABLE IF NOT EXISTS pricing.pricing_rules (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(255) NOT NULL,
    target_scope VARCHAR(20)  NOT NULL CHECK (target_scope IN ('GLOBAL','CATEGORY','SKU','REGION')),
    target_id    VARCHAR(100),
    -- JSONB conditions: e.g. {"stock_level": "<0.15", "competitor_price": "any"}
    conditions   JSONB        NOT NULL DEFAULT '{}',
    -- JSONB action_logic: e.g. {"type": "markup", "value": 0.20}
    action_logic JSONB        NOT NULL DEFAULT '{}',
    priority     INTEGER      NOT NULL DEFAULT 0,
    is_active    BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index for fast active-rule lookups by scope and target
CREATE INDEX IF NOT EXISTS idx_pricing_rules_scope_active
    ON pricing.pricing_rules (target_scope, is_active, priority);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION pricing.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$;

CREATE TRIGGER pricing_rules_updated_at
    BEFORE UPDATE ON pricing.pricing_rules
    FOR EACH ROW EXECUTE FUNCTION pricing.update_updated_at();

-- Row Level Security
ALTER TABLE pricing.pricing_rules ENABLE ROW LEVEL SECURITY;

-- Policy: service_role bypasses RLS; anon users can only read
CREATE POLICY "pricing_rules_read_policy"
    ON pricing.pricing_rules FOR SELECT
    TO authenticated, anon
    USING (TRUE);

CREATE POLICY "pricing_rules_write_policy"
    ON pricing.pricing_rules FOR ALL
    TO service_role
    USING (TRUE) WITH CHECK (TRUE);
