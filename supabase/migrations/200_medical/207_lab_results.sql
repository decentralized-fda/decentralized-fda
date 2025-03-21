-- Lab Results
CREATE TABLE medical.lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    lab_test_id UUID NOT NULL REFERENCES medical_ref.lab_tests(id) ON DELETE CASCADE,
    value DECIMAL,
    unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    reference_range TEXT,
    is_abnormal BOOLEAN,
    test_date TIMESTAMP WITH TIME ZONE NOT NULL,
    lab_name TEXT,
    ordering_provider TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical.lab_results ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own lab results"
    ON medical.lab_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lab results"
    ON medical.lab_results FOR ALL
    USING (auth.uid() = user_id); 