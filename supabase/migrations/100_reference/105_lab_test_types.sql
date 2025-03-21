-- Lab Test Types
--
-- Standard laboratory test definitions and reference ranges
-- Used to validate and interpret lab results
--
CREATE TABLE reference.lab_test_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100),
    category VARCHAR(50),
    description TEXT,
    variable_id UUID REFERENCES reference.variables(id),
    unit_id UUID REFERENCES reference.units_of_measurement(id),
    default_value DECIMAL,
    minimum_allowed_value DECIMAL,
    maximum_allowed_value DECIMAL,
    reference_range_minimum DECIMAL,
    reference_range_maximum DECIMAL,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
); 