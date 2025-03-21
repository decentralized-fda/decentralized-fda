-- User Medications
--
-- User-specific medication records and prescriptions
-- Links to standard medication variables in the reference schema
--
CREATE TABLE personal.user_medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    medication_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    dosage DECIMAL,
    unit_id UUID REFERENCES reference.units_of_measurement(id),
    frequency VARCHAR(50),
    route_of_administration VARCHAR(50),
    start_at TIMESTAMP WITH TIME ZONE,
    end_at TIMESTAMP WITH TIME ZONE,
    prescriber TEXT,
    pharmacy TEXT,
    prescription_number VARCHAR(50),
    notes TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE personal.user_medications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own medications"
    ON personal.user_medications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own medications"
    ON personal.user_medications FOR ALL
    USING (auth.uid() = user_id); 