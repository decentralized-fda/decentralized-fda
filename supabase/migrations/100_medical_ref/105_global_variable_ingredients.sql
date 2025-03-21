-- Global Variable Ingredients
--
-- Defines compositional relationships between global variables, particularly useful for:
-- * Drug formulations (active and inactive ingredients)
-- * Nutritional compositions (ingredients in foods)
-- * Complex medical treatments (components of a treatment protocol)
--
-- Examples:
-- * Tylenol 500mg tablet -> Acetaminophen (active), binding agents (inactive)
-- * Protein Shake -> Protein, Carbs, Fats, Vitamins
-- * Chemotherapy Protocol -> Multiple drugs with specific proportions
--
CREATE TABLE medical_ref.global_variable_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    ingredient_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    amount DECIMAL,                    -- Specific amount of the ingredient
    unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    proportion DECIMAL,                -- Alternative to amount/unit for relative proportions
    is_active_ingredient BOOLEAN DEFAULT FALSE,  -- Particularly relevant for medications
    version_number INTEGER NOT NULL DEFAULT 1,   -- For tracking formulation changes
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(parent_variable_id, ingredient_variable_id, version_number),
    CONSTRAINT no_self_reference CHECK (parent_variable_id != ingredient_variable_id)
);

COMMENT ON TABLE medical_ref.global_variable_ingredients IS 'Defines compositional relationships between global variables, such as ingredients in medications or components of treatments';
COMMENT ON COLUMN medical_ref.global_variable_ingredients.parent_variable_id IS 'The compound/composite variable (e.g., the medication or treatment)';
COMMENT ON COLUMN medical_ref.global_variable_ingredients.ingredient_variable_id IS 'The component variable (e.g., the active ingredient)';
COMMENT ON COLUMN medical_ref.global_variable_ingredients.amount IS 'Specific quantity of the ingredient when unit is specified';
COMMENT ON COLUMN medical_ref.global_variable_ingredients.proportion IS 'Relative proportion (0-1) when exact amounts are not applicable';
COMMENT ON COLUMN medical_ref.global_variable_ingredients.is_active_ingredient IS 'Indicates if this is an active ingredient in a medication or primary component in a treatment';
COMMENT ON COLUMN medical_ref.global_variable_ingredients.version_number IS 'Tracks different versions of formulations or compositions'; 