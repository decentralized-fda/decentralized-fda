-- User Variables
--
-- User-specific variable settings and preferences
-- Links to global variables but contains user-specific configurations
--
CREATE TABLE personal.user_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    variable_id UUID NOT NULL REFERENCES reference.variables(id),
    display_name VARCHAR(100),
    description TEXT,
    unit_id UUID REFERENCES reference.units_of_measurement(id),
    default_value DECIMAL,
    minimum_value DECIMAL,
    maximum_value DECIMAL,
    filling_type VARCHAR(50),
    joining_type VARCHAR(50),
    onset_delay INTERVAL,
    duration_of_action INTERVAL,
    measurement_source VARCHAR(50),
    measurement_method VARCHAR(100),
    last_processed_at TIMESTAMP WITH TIME ZONE,
    analysis_settings JSONB,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, variable_id)
);

-- Enable RLS
ALTER TABLE personal.user_variables ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own variables"
    ON personal.user_variables FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own variables"
    ON personal.user_variables FOR ALL
    USING (auth.uid() = user_id); 