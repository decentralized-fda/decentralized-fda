-- User Variable Relationships
--
-- User-specific relationships between variables
-- Stores individual correlation data and settings
--
CREATE TABLE personal.user_variable_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    cause_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    effect_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    onset_delay INTERVAL,
    duration_of_action INTERVAL,
    correlation_coefficient DECIMAL CHECK (correlation_coefficient BETWEEN -1 AND 1),
    confidence_level VARCHAR(20),
    confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
    user_vote INTEGER CHECK (user_vote BETWEEN -1 AND 1),
    user_notes TEXT,
    status VARCHAR(20),
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, cause_variable_id, effect_variable_id)
);

-- Enable RLS
ALTER TABLE personal.user_variable_relationships ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own relationships"
    ON personal.user_variable_relationships FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own relationships"
    ON personal.user_variable_relationships FOR ALL
    USING (auth.uid() = user_id); 