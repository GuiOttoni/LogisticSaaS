-- Seed data for local development
-- Inserts three sample pricing rules that match the prototype RulesView mock data.

INSERT INTO pricing.pricing_rules (name, target_scope, target_id, conditions, action_logic, priority, is_active)
VALUES
(
    'Estratégia de Escassez',
    'GLOBAL',
    NULL,
    '{"stock_level": "<0.15"}',
    '{"type": "markup_percent", "value": 20}',
    1,
    TRUE
),
(
    'Liquidação Noturna',
    'GLOBAL',
    NULL,
    '{"hour_gte": 22}',
    '{"type": "markdown_percent", "value": 10}',
    2,
    TRUE
),
(
    'Competição Real-time',
    'SKU',
    'NIKE-AIR-MAX-90',
    '{"competitor_price_lt": "min_price"}',
    '{"type": "match_price"}',
    3,
    FALSE
);

-- Seed inventory snapshot
INSERT INTO orders.inventory_snapshot (sku_id, total_reserved, total_available, last_update)
VALUES
    ('NIKE-AIR-MAX-90',   2,   10, NOW()),
    ('IPHONE-15-PRO',     5,   40, NOW()),
    ('PS5-SLIM-CONSOLE',  1,    7, NOW()),
    ('SONY-WH-1000XM5',  10,  110, NOW())
ON CONFLICT (sku_id) DO NOTHING;
