-- External Treatment Effectiveness Ratings
--
-- Stores treatment effectiveness ratings collected from external platforms (social media, forums, etc.).
-- These are similar to user ratings but come from external sources and include additional metadata.
--
CREATE TABLE medical.external_treatment_effectiveness_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,                -- Source platform (e.g., Reddit, Twitter)
    platform_user_id TEXT,                 -- User identifier on the source platform
    platform_post_id TEXT,                 -- Post/comment identifier on the source platform
    platform_post_url TEXT,                -- URL to the original post/comment
    predictor_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    outcome_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    effectiveness_rating TEXT CHECK (effectiveness_rating IN ('much_worse', 'worse', 'no_effect', 'better', 'much_better')),
    numeric_rating INTEGER CHECK (numeric_rating BETWEEN 1 AND 5),
    side_effects_rating TEXT CHECK (side_effects_rating IN ('none', 'mild', 'moderate', 'severe', 'intolerable')),
    review_text TEXT,
    sentiment_score DECIMAL CHECK (sentiment_score BETWEEN -1 AND 1),
    confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
    reported_at TIMESTAMPTZ,               -- When the review was posted on the platform
    collected_at TIMESTAMPTZ DEFAULT NOW(), -- When we collected the review
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
CREATE INDEX idx_external_treatment_ratings_platform ON medical.external_treatment_effectiveness_ratings(platform);
CREATE INDEX idx_external_treatment_ratings_predictor ON medical.external_treatment_effectiveness_ratings(predictor_variable_id);
CREATE INDEX idx_external_treatment_ratings_outcome ON medical.external_treatment_effectiveness_ratings(outcome_variable_id);
CREATE INDEX idx_external_treatment_ratings_platform_user ON medical.external_treatment_effectiveness_ratings(platform, platform_user_id);
CREATE INDEX idx_external_treatment_ratings_reported_at ON medical.external_treatment_effectiveness_ratings(reported_at);
CREATE INDEX idx_external_treatment_ratings_effectiveness ON medical.external_treatment_effectiveness_ratings(effectiveness_rating);
CREATE INDEX idx_external_treatment_ratings_linked_user ON medical.external_treatment_effectiveness_ratings(linked_user_id);

-- Enable RLS
ALTER TABLE medical.external_treatment_effectiveness_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view external ratings"
    ON medical.external_treatment_effectiveness_ratings FOR SELECT
    USING (true);

CREATE POLICY "Staff can manage external ratings"
    ON medical.external_treatment_effectiveness_ratings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM core.user_permissions up
            WHERE up.user_id = auth.uid()
            AND up.permission = 'manage_external_ratings'
        )
    ); 