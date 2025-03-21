-- User Treatment Effectiveness Ratings
--
-- Stores user-reported effectiveness ratings for treatments
-- These can be aggregated into global treatment effectiveness statistics
--
CREATE TABLE personal.user_treatment_effectiveness_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    treatment_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    condition_variable_id UUID NOT NULL REFERENCES reference.variables(id),
    effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
    side_effect_rating INTEGER CHECK (side_effect_rating BETWEEN 1 AND 5),
    adherence_rating INTEGER CHECK (adherence_rating BETWEEN 1 AND 5),
    cost_rating INTEGER CHECK (cost_rating BETWEEN 1 AND 5),
    review_text TEXT,
    is_public BOOLEAN DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, treatment_variable_id, condition_variable_id)
);

-- Enable RLS
ALTER TABLE personal.user_treatment_effectiveness_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view public ratings"
    ON personal.user_treatment_effectiveness_ratings FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own ratings"
    ON personal.user_treatment_effectiveness_ratings FOR ALL
    USING (auth.uid() = user_id); 