-- Medical Conditions
CREATE TABLE medical.conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    onset_date DATE,
    resolution_date DATE,
    status TEXT CHECK (status IN ('active', 'resolved', 'recurring', 'chronic')),
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
    diagnosis_type TEXT CHECK (diagnosis_type IN ('self_reported', 'professional', 'confirmed')),
    diagnosed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical.conditions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own conditions"
    ON medical.conditions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conditions"
    ON medical.conditions FOR ALL
    USING (auth.uid() = user_id); 