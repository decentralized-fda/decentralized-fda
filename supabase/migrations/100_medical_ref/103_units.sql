-- Units of Measurement
CREATE TABLE medical_ref.units_of_measurement (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    symbol TEXT NOT NULL,
    unit_type TEXT NOT NULL,
    conversion_factor DECIMAL,
    base_unit_id UUID,
    ucum_code TEXT UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add self-reference after table creation
ALTER TABLE medical_ref.units_of_measurement 
    ADD CONSTRAINT fk_units_base_unit 
    FOREIGN KEY (base_unit_id) 
    REFERENCES medical_ref.units_of_measurement(id) ON DELETE SET NULL; 