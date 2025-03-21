-- =============================================
-- MEDICAL_REF SCHEMA - Reference Medical Data
-- =============================================

-- Variable Categories
CREATE TABLE medical_ref.variable_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    parent_category_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add self-reference after table creation
ALTER TABLE medical_ref.variable_categories 
    ADD CONSTRAINT fk_variable_categories_parent 
    FOREIGN KEY (parent_category_id) 
    REFERENCES medical_ref.variable_categories(id) ON DELETE SET NULL;

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
    
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(name, category_id)
);

-- Variable Ingredients
CREATE TABLE medical_ref.variable_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    ingredient_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    amount DECIMAL,
    unit_id UUID,  -- Will reference units_of_measurement later
    proportion DECIMAL,
    is_active_ingredient BOOLEAN DEFAULT FALSE,
    version_number INTEGER NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(parent_variable_id, ingredient_variable_id, version_number),
    CONSTRAINT no_self_reference CHECK (parent_variable_id != ingredient_variable_id)
);

-- Variable Relationships
CREATE TABLE medical_ref.variable_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    predictor_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    outcome_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('correlates_with', 'contraindicated_with', 'treats', 'prevents', 'causes', 'exacerbates', 'diagnostic_for')),
    strength DECIMAL,
    evidence_level TEXT CHECK (evidence_level IN ('anecdotal', 'observational', 'clinical_trial', 'meta_analysis')),
    source_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(predictor_variable_id, outcome_variable_id, relationship_type),
    CONSTRAINT no_self_relationship CHECK (predictor_variable_id != outcome_variable_id)
);

-- Variable Synonyms
CREATE TABLE medical_ref.variable_synonyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    synonym TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(global_variable_id, synonym, language)
);

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

-- Add foreign key reference to variable_ingredients
ALTER TABLE medical_ref.variable_ingredients
    ADD CONSTRAINT fk_variable_ingredients_unit
    FOREIGN KEY (unit_id)
    REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT;

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

-- Lab Tests
CREATE TABLE medical_ref.lab_tests (
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

-- Create aggregated ratings materialized view
CREATE MATERIALIZED VIEW medical_ref.aggregated_variable_ratings AS
SELECT 
    vr.predictor_variable_id,
    vr.outcome_variable_id,
    gv1.name AS predictor_variable_name,
    gv2.name AS outcome_variable_name,
    COUNT(vr.id) AS total_ratings,

    -- Effectiveness distribution
    COUNT(CASE WHEN vr.effectiveness_rating = 'much_worse' THEN 1 END) AS much_worse_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'worse' THEN 1 END) AS worse_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'no_effect' THEN 1 END) AS no_effect_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'better' THEN 1 END) AS better_count,
    COUNT(CASE WHEN vr.effectiveness_rating = 'much_better' THEN 1 END) AS much_better_count,

    -- Average numeric rating (1-5 scale)
    AVG(vr.numeric_rating) AS avg_numeric_rating,

    -- Side effects distribution
    COUNT(CASE WHEN vr.side_effects_rating = 'none' THEN 1 END) AS no_side_effects_count,
    COUNT(CASE WHEN vr.side_effects_rating = 'mild' THEN 1 END) AS mild_side_effects_count,
    COUNT(CASE WHEN vr.side_effects_rating = 'moderate' THEN 1 END) AS moderate_side_effects_count,
    COUNT(CASE WHEN vr.side_effects_rating = 'severe' THEN 1 END) AS severe_side_effects_count,
    COUNT(CASE WHEN vr.side_effects_rating = 'intolerable' THEN 1 END) AS intolerable_side_effects_count,

    -- Verified ratings count
    COUNT(CASE WHEN vr.is_verified = TRUE THEN 1 END) AS verified_ratings_count
FROM 
    medical.variable_ratings vr
JOIN 
    medical_ref.global_variables gv1 ON vr.predictor_variable_id = gv1.id
JOIN 
    medical_ref.global_variables gv2 ON vr.outcome_variable_id = gv2.id
WHERE 
    vr.is_public = TRUE
GROUP BY 
    vr.predictor_variable_id, vr.outcome_variable_id, gv1.name, gv2.name
WITH NO DATA;

-- Create unique index for the materialized view
CREATE UNIQUE INDEX idx_aggregated_ratings_variables 
ON medical_ref.aggregated_variable_ratings(predictor_variable_id, outcome_variable_id); 