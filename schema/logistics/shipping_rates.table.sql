-- Table: logistics.shipping_rates

CREATE TABLE logistics.shipping_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipping_method_id UUID NOT NULL REFERENCES logistics.shipping_methods(id) ON DELETE CASCADE,
    min_weight DECIMAL,
    max_weight DECIMAL,
    min_total DECIMAL,
    max_total DECIMAL,
    base_rate DECIMAL NOT NULL CHECK (base_rate >= 0),
    per_item_rate DECIMAL NOT NULL DEFAULT 0 CHECK (per_item_rate >= 0),
    per_weight_rate DECIMAL NOT NULL DEFAULT 0 CHECK (per_weight_rate >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_weight_range CHECK (min_weight IS NULL OR max_weight IS NULL OR min_weight <= max_weight),
    CONSTRAINT valid_total_range CHECK (min_total IS NULL OR max_total IS NULL OR min_total <= max_total)
);
