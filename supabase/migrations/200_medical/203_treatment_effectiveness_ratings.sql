-- Treatment Effectiveness Ratings
--
-- Stores user ratings of how effective different treatments are for various conditions.
-- Each rating represents a user's experience with a treatment (predictor) for a specific condition (outcome).
--
CREATE TABLE medical.treatment_effectiveness_ratings (
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

-- Enable RLS
ALTER TABLE medical.treatment_effectiveness_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view public ratings"
    ON medical.treatment_effectiveness_ratings FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own ratings"
    ON medical.treatment_effectiveness_ratings FOR ALL
    USING (auth.uid() = user_id); 