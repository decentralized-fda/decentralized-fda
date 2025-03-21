-- Variables
--
-- Standard medical variables that can be measured or tracked
-- These form the foundation for all health tracking in the system
--
CREATE TABLE reference.variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    category_id UUID REFERENCES reference.variable_categories(id),
    default_unit_id UUID REFERENCES reference.units_of_measurement(id),
    data_type VARCHAR(50) NOT NULL,
    valence_type VARCHAR(50),
    measurement_method VARCHAR(100),
    measurement_frequency VARCHAR(50),
    filling_type VARCHAR(50),
    joining_type VARCHAR(50),
    onset_delay INTERVAL,
    duration_of_action INTERVAL,
    outcome_population_type VARCHAR(50),
    minimum_allowed_value DECIMAL,
    maximum_allowed_value DECIMAL,
    default_value DECIMAL,
    is_public BOOLEAN DEFAULT true,
    sort_order INTEGER,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(name)
); 