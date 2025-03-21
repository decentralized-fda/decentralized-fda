-- Variable Ratings
CREATE TABLE medical.variable_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    predictor_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    outcome_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    effectiveness_rating TEXT CHECK (effectiveness_rating IN ('much_worse', 'worse', 'no_effect', 'better', 'much_better')),
    numeric_rating INTEGER CHECK (numeric_rating BETWEEN 1 AND 5),
    side_effects_rating TEXT CHECK (side_effects_rating IN ('none', 'mild', 'moderate', 'severe', 'intolerable')),
    review_text TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, predictor_variable_id, outcome_variable_id)
);

-- External Treatment Reports
CREATE TABLE medical.external_variable_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    platform_user_id TEXT,
    platform_post_id TEXT,
    platform_post_url TEXT,
    predictor_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    outcome_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    effectiveness_rating TEXT CHECK (effectiveness_rating IN ('much_worse', 'worse', 'no_effect', 'better', 'much_better')),
    numeric_rating INTEGER CHECK (numeric_rating BETWEEN 1 AND 5),
    side_effects_rating TEXT CHECK (side_effects_rating IN ('none', 'mild', 'moderate', 'severe', 'intolerable')),
    review_text TEXT,
    sentiment_score DECIMAL CHECK (sentiment_score BETWEEN -1 AND 1),
    confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
    reported_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    linked_user_id UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    verification_notes TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, platform_post_id)
);

-- Add indexes for external ratings
CREATE INDEX idx_external_ratings_platform ON medical.external_variable_ratings(platform);
CREATE INDEX idx_external_ratings_predictor ON medical.external_variable_ratings(predictor_variable_id);
CREATE INDEX idx_external_ratings_outcome ON medical.external_variable_ratings(outcome_variable_id);
CREATE INDEX idx_external_ratings_platform_user ON medical.external_variable_ratings(platform, platform_user_id);
CREATE INDEX idx_external_ratings_reported_at ON medical.external_variable_ratings(reported_at);
CREATE INDEX idx_external_ratings_effectiveness ON medical.external_variable_ratings(effectiveness_rating);
CREATE INDEX idx_external_ratings_linked_user ON medical.external_variable_ratings(linked_user_id);

-- Enable RLS
ALTER TABLE medical.variable_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.external_variable_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view public ratings"
    ON medical.variable_ratings FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own ratings"
    ON medical.variable_ratings FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view external ratings"
    ON medical.external_variable_ratings FOR SELECT
    USING (true);

CREATE POLICY "Staff can manage external ratings"
    ON medical.external_variable_ratings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM core.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission = 'manage_external_ratings'
        )
    ); 