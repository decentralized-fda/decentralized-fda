-- Variable Ingredients
--
-- Defines compositional relationships between variables from various sources:
-- * Reference data (official formulations)
-- * User contributions
-- * Expert knowledge
-- * Aggregated data
--
-- Examples:
-- * Drug formulations (active and inactive ingredients)
-- * Nutritional compositions (ingredients in foods)
-- * Complex medical treatments (components of a treatment protocol)
--
CREATE TABLE reference.variable_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_variable_id UUID NOT NULL REFERENCES reference.variables(id) ON DELETE CASCADE,
    ingredient_variable_id UUID NOT NULL REFERENCES reference.variables(id) ON DELETE CASCADE,
    amount DECIMAL,                    -- Specific amount of the ingredient
    unit_id UUID REFERENCES reference.units_of_measurement(id) ON DELETE RESTRICT,
    proportion DECIMAL,                -- Alternative to amount/unit for relative proportions
    is_active_ingredient BOOLEAN DEFAULT FALSE,  -- Particularly relevant for medications
    version_number INTEGER NOT NULL DEFAULT 1,   -- For tracking formulation changes
    source_type TEXT NOT NULL CHECK (source_type IN ('reference', 'user', 'expert', 'aggregate')),
    source_id UUID,                    -- ID of the user/expert who contributed this
    confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(parent_variable_id, ingredient_variable_id, version_number, source_type),
    CONSTRAINT no_self_reference CHECK (parent_variable_id != ingredient_variable_id)
);

-- Enable RLS
ALTER TABLE reference.variable_ingredients ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Everyone can view ingredients"
    ON reference.variable_ingredients FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can insert user contributions"
    ON reference.variable_ingredients FOR INSERT
    TO authenticated
    WITH CHECK (source_type = 'user' AND source_id = auth.uid());

CREATE POLICY "Users can update their own contributions"
    ON reference.variable_ingredients FOR UPDATE
    TO authenticated
    USING (source_type = 'user' AND source_id = auth.uid());

COMMENT ON TABLE reference.variable_ingredients IS 'Defines compositional relationships between variables from various sources';
COMMENT ON COLUMN reference.variable_ingredients.parent_variable_id IS 'The compound/composite variable (e.g., the medication or treatment)';
COMMENT ON COLUMN reference.variable_ingredients.ingredient_variable_id IS 'The component variable (e.g., the active ingredient)';
COMMENT ON COLUMN reference.variable_ingredients.amount IS 'Specific quantity of the ingredient when unit is specified';
COMMENT ON COLUMN reference.variable_ingredients.proportion IS 'Relative proportion (0-1) when exact amounts are not applicable';
COMMENT ON COLUMN reference.variable_ingredients.is_active_ingredient IS 'Indicates if this is an active ingredient in a medication or primary component in a treatment';
COMMENT ON COLUMN reference.variable_ingredients.version_number IS 'Tracks different versions of formulations or compositions';
COMMENT ON COLUMN reference.variable_ingredients.source_type IS 'Origin of the ingredient data (reference, user, expert, aggregate)';
COMMENT ON COLUMN reference.variable_ingredients.source_id IS 'ID of the user/expert who contributed this data';
COMMENT ON COLUMN reference.variable_ingredients.confidence_score IS 'Confidence in the accuracy of this ingredient relationship (0-1)'; 