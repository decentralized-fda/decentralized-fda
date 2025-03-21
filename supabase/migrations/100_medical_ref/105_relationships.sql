-- Variable Ingredients
CREATE TABLE medical_ref.variable_ingredients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    ingredient_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    amount DECIMAL,
    unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
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