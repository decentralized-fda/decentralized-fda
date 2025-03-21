-- User Conditions
--
-- User-specific medical conditions and diagnoses
-- Links to standard condition variables in the reference schema
--
CREATE TABLE personal.user_conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    condition_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    onset_at TIMESTAMP WITH TIME ZONE,
    resolution_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL,
    severity INTEGER CHECK (severity BETWEEN 1 AND 5),
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE personal.user_conditions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own conditions"
    ON personal.user_conditions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conditions"
    ON personal.user_conditions FOR ALL
    USING (auth.uid() = user_id); 