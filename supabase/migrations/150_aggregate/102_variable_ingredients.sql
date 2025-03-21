-- Variable Ingredients
--
-- Aggregated ingredient relationships between variables
-- Compiled from user contributions and expert knowledge
--
CREATE TABLE aggregate.variable_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ingredient_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    composite_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    amount DECIMAL,
    unit_id UUID REFERENCES reference.units_of_measurement(id),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ingredient_variable_id, composite_variable_id)
); 