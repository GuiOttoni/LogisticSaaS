-- =============================================================================
-- Migration 004: Add Pricing Solver columns to pricing_rules
-- Adds weight, multiplier, base_markup required by the C++ Pricing Solver
-- formula: finalPrice = (basePrice * (1 - weight)) + ((basePrice + base_markup) * multiplier * weight)
-- =============================================================================

ALTER TABLE pricing.pricing_rules
    ADD COLUMN IF NOT EXISTS weight      DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS multiplier  DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    ADD COLUMN IF NOT EXISTS base_markup DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- Constraints: weight must be a blend factor between 0 and 1
ALTER TABLE pricing.pricing_rules
    ADD CONSTRAINT IF NOT EXISTS chk_weight_range
        CHECK (weight >= 0.0 AND weight <= 1.0);
