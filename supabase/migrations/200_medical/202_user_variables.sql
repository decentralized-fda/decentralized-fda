-- User Variables
CREATE TABLE medical.user_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    custom_name TEXT,
    custom_description TEXT,
    preferred_unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, global_variable_id)
);

-- Variable Measurements
CREATE TABLE medical.variable_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    value DECIMAL,
    unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    original_value DECIMAL,
    original_unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    measurement_time TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT,
    notes TEXT,
    is_estimated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical.user_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.variable_measurements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own variables"
    ON medical.user_variables FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own variables"
    ON medical.user_variables FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own measurements"
    ON medical.variable_measurements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own measurements"
    ON medical.variable_measurements FOR ALL
    USING (auth.uid() = user_id); 