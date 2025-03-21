-- Lab Test Types
-- Defines the types/categories of laboratory tests that can be ordered and performed.
-- This is a reference table for test definitions, not actual test results.
CREATE TABLE medical_ref.lab_test_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    loinc_code TEXT,
    test_type TEXT NOT NULL,
    specimen_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE medical_ref.lab_test_types IS 'Reference table defining types of laboratory tests that can be ordered. Each row represents a test definition, not an actual test instance.';
COMMENT ON COLUMN medical_ref.lab_test_types.name IS 'Name of the lab test type (e.g., Complete Blood Count, Basic Metabolic Panel)';
COMMENT ON COLUMN medical_ref.lab_test_types.test_type IS 'Category or methodology of the test (e.g., Blood Test, Urinalysis, Culture)';
COMMENT ON COLUMN medical_ref.lab_test_types.specimen_type IS 'Type of specimen required (e.g., Blood, Urine, Tissue)';
COMMENT ON COLUMN medical_ref.lab_test_types.loinc_code IS 'LOINC (Logical Observation Identifiers Names and Codes) code for standardized test identification'; 