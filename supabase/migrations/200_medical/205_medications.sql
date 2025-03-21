-- Medications
CREATE TABLE medical.medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    dosage DECIMAL,
    unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    frequency TEXT,
    route TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('active', 'discontinued', 'as_needed')),
    prescribed_by TEXT,
    pharmacy TEXT,
    prescription_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical.medications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own medications"
    ON medical.medications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own medications"
    ON medical.medications FOR ALL
    USING (auth.uid() = user_id); 