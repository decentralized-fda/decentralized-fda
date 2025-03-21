-- Data Quality Rules
--
-- This table defines validation rules for global variables in the medical reference system.
-- Each variable can have multiple rules of different types to ensure data quality and clinical safety.
--
-- Rule Types:
--   - range: Validates numeric values against min/max bounds
--      * Can be used for both hard limits (is_warning=false) and advisory ranges (is_warning=true)
--      * Example: Blood pressure must be between 60-300 mmHg (hard limit)
--      * Example: Warning if blood pressure outside 90-180 mmHg (advisory)
--
--   - pattern: Validates text input against a regex pattern
--      * Useful for format validation and standardization
--      * Example: Ensuring blood pressure is entered as 2-3 digits
--
--   - required: Ensures the field is not null
--      * Used for mandatory measurements or observations
--
--   - unique: Ensures values don't duplicate within a context
--      * Useful for identifiers or codes that should not repeat
--
--   - custom: Allows complex validation via custom functions
--      * Used for multi-field validation or complex medical rules
--      * Example: Ensuring systolic BP is higher than diastolic BP
--
CREATE TABLE medical_ref.data_quality_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    rule_type TEXT CHECK (rule_type IN ('range', 'pattern', 'required', 'unique', 'custom')),
    min_value DECIMAL,                    -- Used for range validation
    max_value DECIMAL,                    -- Used for range validation
    pattern TEXT,                         -- Regex pattern for text validation
    error_message TEXT NOT NULL,          -- User-friendly error message
    is_warning BOOLEAN DEFAULT FALSE,     -- If true, rule violation creates warning; if false, creates error
    custom_validation_function TEXT,      -- Name of custom validation function for complex rules
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 

-- Add database-level comments that can be queried
COMMENT ON TABLE medical_ref.data_quality_rules IS 'Defines validation rules for global variables in the medical reference system. Each variable can have multiple rules of different types to ensure data quality and clinical safety.';

COMMENT ON COLUMN medical_ref.data_quality_rules.rule_type IS 'Type of validation rule: range (numeric bounds), pattern (regex), required (not null), unique (no duplicates), or custom (complex validation)';
COMMENT ON COLUMN medical_ref.data_quality_rules.min_value IS 'Minimum allowed value for range validation rules';
COMMENT ON COLUMN medical_ref.data_quality_rules.max_value IS 'Maximum allowed value for range validation rules';
COMMENT ON COLUMN medical_ref.data_quality_rules.pattern IS 'Regular expression pattern for text validation rules';
COMMENT ON COLUMN medical_ref.data_quality_rules.error_message IS 'User-friendly message displayed when validation fails';
COMMENT ON COLUMN medical_ref.data_quality_rules.is_warning IS 'If true, rule violation creates a warning; if false, creates an error';
COMMENT ON COLUMN medical_ref.data_quality_rules.custom_validation_function IS 'Name of custom PostgreSQL function for complex validation rules'; 