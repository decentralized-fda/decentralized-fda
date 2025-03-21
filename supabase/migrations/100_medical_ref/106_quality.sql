-- Data Quality Rules
CREATE TABLE medical_ref.data_quality_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    rule_type TEXT CHECK (rule_type IN ('range', 'pattern', 'required', 'unique', 'custom')),
    min_value DECIMAL,
    max_value DECIMAL,
    pattern TEXT,
    error_message TEXT NOT NULL,
    is_warning BOOLEAN DEFAULT FALSE,
    custom_validation_function TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 