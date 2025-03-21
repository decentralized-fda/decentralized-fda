-- User External Treatment Effectiveness Ratings
--
-- Stores treatment effectiveness ratings imported from external sources
-- These are linked to specific users but may come from third-party data
--
CREATE TABLE personal.user_external_treatment_effectiveness_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    treatment_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    condition_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    data_source VARCHAR(50) NOT NULL,
    data_source_id VARCHAR(100),
    effectiveness_score DECIMAL CHECK (effectiveness_score BETWEEN 0 AND 100),
    number_of_participants INTEGER,
    study_design VARCHAR(50),
    study_quality_score DECIMAL CHECK (study_quality_score BETWEEN 0 AND 100),
    confidence_interval_min DECIMAL,
    confidence_interval_max DECIMAL,
    p_value DECIMAL CHECK (p_value BETWEEN 0 AND 1),
    snippet_text TEXT,
    snippet_source_url TEXT,
    full_study_url TEXT,
    full_study_pdf_url TEXT,
    publication_date DATE,
    is_public BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, data_source, data_source_id)
);

-- Enable RLS
ALTER TABLE personal.user_external_treatment_effectiveness_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view public external ratings"
    ON personal.user_external_treatment_effectiveness_ratings FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own external ratings"
    ON personal.user_external_treatment_effectiveness_ratings FOR ALL
    USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_external_ratings_treatment 
    ON personal.user_external_treatment_effectiveness_ratings(treatment_variable_id);
    
CREATE INDEX idx_external_ratings_condition 
    ON personal.user_external_treatment_effectiveness_ratings(condition_variable_id);
    
CREATE INDEX idx_external_ratings_data_source 
    ON personal.user_external_treatment_effectiveness_ratings(data_source);

CREATE INDEX idx_external_ratings_effectiveness 
    ON personal.user_external_treatment_effectiveness_ratings(effectiveness_score);

CREATE INDEX idx_external_ratings_study_quality 
    ON personal.user_external_treatment_effectiveness_ratings(study_quality_score); 