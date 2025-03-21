-- Variable Relationships
--
-- Aggregated relationships between variables
-- Derived from user data and statistical analysis
--
CREATE TABLE aggregate.variable_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cause_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    effect_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    relationship_type VARCHAR(50),
    confidence_level VARCHAR(20),
    confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
    correlation_coefficient DECIMAL CHECK (correlation_coefficient BETWEEN -1 AND 1),
    onset_delay INTERVAL,
    duration_of_action INTERVAL,
    number_of_pairs INTEGER,
    number_of_users INTEGER,
    strength_level VARCHAR(20),
    relationship_status VARCHAR(20),
    evidence_status VARCHAR(20),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cause_variable_id, effect_variable_id)
); 