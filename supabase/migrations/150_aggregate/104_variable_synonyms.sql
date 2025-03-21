-- Variable Synonyms
--
-- Aggregated synonyms and alternative names for variables
-- Collected from user input and external sources
--
CREATE TABLE aggregate.variable_synonyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    variable_id UUID NOT NULL REFERENCES reference.variables(id),
    name VARCHAR(100) NOT NULL,
    source VARCHAR(50),
    confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(variable_id, name)
); 