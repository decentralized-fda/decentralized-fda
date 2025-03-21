-- Global Variable Relationships
--
-- Defines evidence-based relationships between global medical variables, such as:
-- * Causal relationships (X causes Y)
-- * Treatment relationships (X treats Y)
-- * Contraindications (X is dangerous with Y)
-- * Diagnostic relationships (X is diagnostic for Y)
--
-- Relationship Types:
-- * correlates_with: Statistical correlation without proven causation
-- * contraindicated_with: Should not be used together
-- * treats: Used to treat or manage
-- * prevents: Helps prevent occurrence
-- * causes: Directly causes or increases risk
-- * exacerbates: Makes condition worse
-- * diagnostic_for: Used to diagnose
--
-- Evidence Levels:
-- * anecdotal: Based on individual reports
-- * observational: Based on observational studies
-- * clinical_trial: Based on clinical trials
-- * meta_analysis: Based on systematic reviews
--
CREATE TABLE medical_ref.global_variable_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    predictor_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    outcome_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('correlates_with', 'contraindicated_with', 'treats', 'prevents', 'causes', 'exacerbates', 'diagnostic_for')),
    strength DECIMAL,                -- Strength of relationship (0-1)
    evidence_level TEXT CHECK (evidence_level IN ('anecdotal', 'observational', 'clinical_trial', 'meta_analysis')),
    source_url TEXT,                -- URL to source of evidence
    notes TEXT,
    created_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(predictor_variable_id, outcome_variable_id, relationship_type),
    CONSTRAINT no_self_relationship CHECK (predictor_variable_id != outcome_variable_id)
);

COMMENT ON TABLE medical_ref.global_variable_relationships IS 'Defines evidence-based relationships between global medical variables, including causal, treatment, and diagnostic relationships';
COMMENT ON COLUMN medical_ref.global_variable_relationships.predictor_variable_id IS 'The variable that predicts, causes, or treats (the independent variable)';
COMMENT ON COLUMN medical_ref.global_variable_relationships.outcome_variable_id IS 'The variable that is affected, caused, or treated (the dependent variable)';
COMMENT ON COLUMN medical_ref.global_variable_relationships.relationship_type IS 'Type of relationship (correlates_with, treats, causes, etc.)';
COMMENT ON COLUMN medical_ref.global_variable_relationships.strength IS 'Strength of the relationship, typically 0-1 based on statistical evidence';
COMMENT ON COLUMN medical_ref.global_variable_relationships.evidence_level IS 'Level of evidence supporting this relationship';
COMMENT ON COLUMN medical_ref.global_variable_relationships.source_url IS 'URL to the source of evidence (e.g., research paper, clinical guidelines)'; 