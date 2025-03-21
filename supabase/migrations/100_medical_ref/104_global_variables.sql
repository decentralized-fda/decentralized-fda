-- Global Variables
CREATE TABLE medical_ref.global_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category_id UUID NOT NULL REFERENCES medical_ref.variable_categories(id) ON DELETE CASCADE,
    default_unit TEXT,
    
    -- Standard medical codes
    snomed_ct_code TEXT,
    icd_code TEXT,
    rxnorm_code TEXT,
    loinc_code TEXT,
    fdc_id TEXT,
    
    -- Configuration
    combination_operation varchar(4) CHECK (combination_operation IN ('SUM', 'MEAN')),
    filling_type varchar(13) CHECK (filling_type IN ('zero', 'none', 'interpolation', 'value')),
    filling_value decimal,
    minimum_allowed_value decimal,
    maximum_allowed_value decimal,
    minimum_allowed_seconds_between_measurements integer,
    
    -- Classification
    cause_only boolean DEFAULT false,
    outcome boolean DEFAULT false,
    predictor boolean DEFAULT false,
    controllable boolean,
    
    -- UI/UX
    image_url text,
    informational_url text,
    optimal_value_message text,
    sort_order integer DEFAULT 0,
    manual_tracking boolean DEFAULT true,
    
    -- System
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    is_public boolean DEFAULT true,
    source_url text,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validation
    valence varchar(8) CHECK (valence IN ('positive', 'negative', 'neutral')),
    UNIQUE(name, category_id)
); 