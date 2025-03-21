-- =============================================
-- MEDICAL SCHEMA - User Medical Data
-- =============================================

-- User Variables
CREATE TABLE medical.user_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    custom_name TEXT,
    custom_description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, global_variable_id)
);

-- Variable Measurements
CREATE TABLE medical.variable_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    value DECIMAL,
    unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    measurement_time TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT,
    notes TEXT,
    is_estimated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Medical Conditions
CREATE TABLE medical.conditions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    onset_date DATE,
    resolution_date DATE,
    status TEXT CHECK (status IN ('active', 'resolved', 'recurring', 'chronic')),
    severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
    diagnosis_type TEXT CHECK (diagnosis_type IN ('self_reported', 'professional', 'confirmed')),
    diagnosed_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medications
CREATE TABLE medical.medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    dosage DECIMAL,
    unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    frequency TEXT,
    route TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT CHECK (status IN ('active', 'discontinued', 'as_needed')),
    prescribed_by TEXT,
    pharmacy TEXT,
    prescription_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lab Results
CREATE TABLE medical.lab_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    lab_test_id UUID NOT NULL REFERENCES medical_ref.lab_tests(id) ON DELETE CASCADE,
    value DECIMAL,
    unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    reference_range TEXT,
    is_abnormal BOOLEAN,
    test_date TIMESTAMP WITH TIME ZONE NOT NULL,
    lab_name TEXT,
    ordering_provider TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical Documents
CREATE TABLE medical.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    document_date DATE,
    provider TEXT,
    facility TEXT,
    tags TEXT[],
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- External Treatment Reports
CREATE TABLE medical.external_variable_ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL, -- e.g., 'twitter', 'reddit', 'facebook'
    platform_user_id TEXT, -- External platform's user identifier
    platform_post_id TEXT, -- External platform's post/content identifier
    platform_post_url TEXT, -- URL to the original content if available
    predictor_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    outcome_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    effectiveness_rating TEXT CHECK (effectiveness_rating IN ('much_worse', 'worse', 'no_effect', 'better', 'much_better')),
    numeric_rating INTEGER CHECK (numeric_rating BETWEEN 1 AND 5),
    side_effects_rating TEXT CHECK (side_effects_rating IN ('none', 'mild', 'moderate', 'severe', 'intolerable')),
    review_text TEXT,
    sentiment_score DECIMAL CHECK (sentiment_score BETWEEN -1 AND 1),
    confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
    reported_at TIMESTAMPTZ, -- When the report was made on the platform
    collected_at TIMESTAMPTZ DEFAULT NOW(), -- When we collected the data
    linked_user_id UUID REFERENCES core.profiles(id) ON DELETE SET NULL, -- Link to user if they join later
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES core.profiles(id) ON DELETE SET NULL,
    verification_notes TEXT,
    metadata JSONB, -- Additional platform-specific data
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    -- Ensure we don't duplicate reports from the same user/post
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

-- Enable Row Level Security
ALTER TABLE medical.user_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.variable_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.variable_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.external_variable_ratings ENABLE ROW LEVEL SECURITY;

-- Create policies
-- User Variables
CREATE POLICY "Users can view their own variables"
    ON medical.user_variables FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own variables"
    ON medical.user_variables FOR ALL
    USING (auth.uid() = user_id);

-- Variable Measurements
CREATE POLICY "Users can view their own measurements"
    ON medical.variable_measurements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own measurements"
    ON medical.variable_measurements FOR ALL
    USING (auth.uid() = user_id);

-- Variable Ratings
CREATE POLICY "Users can view public ratings"
    ON medical.variable_ratings FOR SELECT
    USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can manage their own ratings"
    ON medical.variable_ratings FOR ALL
    USING (auth.uid() = user_id);

-- Conditions
CREATE POLICY "Users can view their own conditions"
    ON medical.conditions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own conditions"
    ON medical.conditions FOR ALL
    USING (auth.uid() = user_id);

-- Medications
CREATE POLICY "Users can view their own medications"
    ON medical.medications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own medications"
    ON medical.medications FOR ALL
    USING (auth.uid() = user_id);

-- Lab Results
CREATE POLICY "Users can view their own lab results"
    ON medical.lab_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own lab results"
    ON medical.lab_results FOR ALL
    USING (auth.uid() = user_id);

-- Documents
CREATE POLICY "Users can view their own documents"
    ON medical.documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own documents"
    ON medical.documents FOR ALL
    USING (auth.uid() = user_id);

-- External Treatment Reports
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

-- View combining both user and external ratings
CREATE OR REPLACE VIEW medical.combined_variable_ratings AS
(
    -- User ratings
    SELECT 
        'user' as rating_source,
        id,
        user_id as rater_id,
        NULL as platform,
        NULL as platform_user_id,
        NULL as platform_post_url,
        predictor_variable_id,
        outcome_variable_id,
        effectiveness_rating,
        numeric_rating,
        side_effects_rating,
        review_text,
        NULL::decimal as sentiment_score,
        TRUE as is_verified,
        verified_by,
        created_at as reported_at,
        created_at,
        updated_at
    FROM medical.variable_ratings
    WHERE is_public = true

    UNION ALL

    -- External ratings
    SELECT 
        'external' as rating_source,
        id,
        linked_user_id as rater_id,
        platform,
        platform_user_id,
        platform_post_url,
        predictor_variable_id,
        outcome_variable_id,
        effectiveness_rating,
        numeric_rating,
        side_effects_rating,
        review_text,
        sentiment_score,
        is_verified,
        verified_by,
        reported_at,
        created_at,
        updated_at
    FROM medical.external_variable_ratings
);

-- Function to attempt linking external ratings to a user
CREATE OR REPLACE FUNCTION medical.link_external_ratings_to_user(
    p_user_id UUID,
    p_platform TEXT,
    p_platform_user_id TEXT
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
    v_linked_count integer;
BEGIN
    -- Update external ratings that match the platform and username
    UPDATE medical.external_variable_ratings
    SET 
        linked_user_id = p_user_id,
        updated_at = NOW()
    WHERE platform = p_platform
    AND platform_user_id = p_platform_user_id
    AND linked_user_id IS NULL;

    GET DIAGNOSTICS v_linked_count = ROW_COUNT;
    RETURN v_linked_count;
END;
$$;

-- Add table for OAuth platform identities
CREATE TABLE medical.user_platform_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- e.g., 'twitter', 'reddit', 'facebook'
    platform_user_id TEXT NOT NULL,
    platform_username TEXT,
    platform_email TEXT,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(platform, platform_user_id)
);

-- Add index for quick lookups
CREATE INDEX idx_user_platform_identities_user ON medical.user_platform_identities(user_id);
CREATE INDEX idx_user_platform_identities_platform ON medical.user_platform_identities(platform, platform_user_id);

-- Enable RLS
ALTER TABLE medical.user_platform_identities ENABLE ROW LEVEL SECURITY;

-- Users can view their own platform identities
CREATE POLICY "Users can view their own platform identities"
    ON medical.user_platform_identities FOR SELECT
    USING (auth.uid() = user_id);

-- Users can manage their own platform identities
CREATE POLICY "Users can manage their own platform identities"
    ON medical.user_platform_identities FOR ALL
    USING (auth.uid() = user_id);

-- Function to handle OAuth connection and link ratings
CREATE OR REPLACE FUNCTION medical.connect_oauth_platform(
    p_user_id UUID,
    p_platform TEXT,
    p_platform_user_id TEXT,
    p_platform_username TEXT,
    p_platform_email TEXT,
    p_access_token TEXT,
    p_refresh_token TEXT,
    p_token_expires_at TIMESTAMPTZ,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
    platform_connected boolean,
    ratings_linked integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_linked_count integer;
BEGIN
    -- First, store or update the OAuth connection
    INSERT INTO medical.user_platform_identities (
        user_id,
        platform,
        platform_user_id,
        platform_username,
        platform_email,
        access_token,
        refresh_token,
        token_expires_at,
        metadata
    ) VALUES (
        p_user_id,
        p_platform,
        p_platform_user_id,
        p_platform_username,
        p_platform_email,
        p_access_token,
        p_refresh_token,
        p_token_expires_at,
        p_metadata
    )
    ON CONFLICT (platform, platform_user_id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        platform_username = EXCLUDED.platform_username,
        platform_email = EXCLUDED.platform_email,
        access_token = EXCLUDED.access_token,
        refresh_token = EXCLUDED.refresh_token,
        token_expires_at = EXCLUDED.token_expires_at,
        metadata = EXCLUDED.metadata,
        updated_at = NOW();

    -- Then link any existing ratings from this platform identity
    UPDATE medical.external_variable_ratings
    SET 
        linked_user_id = p_user_id,
        updated_at = NOW()
    WHERE platform = p_platform
    AND (
        platform_user_id = p_platform_user_id
        OR platform_user_id = p_platform_username
        OR metadata->>'email' = p_platform_email
    )
    AND linked_user_id IS NULL;

    GET DIAGNOSTICS v_linked_count = ROW_COUNT;

    RETURN QUERY SELECT
        true as platform_connected,
        v_linked_count as ratings_linked;
END;
$$;

-- Function to refresh OAuth token
CREATE OR REPLACE FUNCTION medical.refresh_oauth_token(
    p_user_id UUID,
    p_platform TEXT,
    p_new_access_token TEXT,
    p_new_refresh_token TEXT,
    p_new_expires_at TIMESTAMPTZ
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE medical.user_platform_identities
    SET
        access_token = p_new_access_token,
        refresh_token = p_new_refresh_token,
        token_expires_at = p_new_expires_at,
        updated_at = NOW()
    WHERE user_id = p_user_id
    AND platform = p_platform;

    RETURN FOUND;
END;
$$;

-- Function to disconnect platform
CREATE OR REPLACE FUNCTION medical.disconnect_oauth_platform(
    p_user_id UUID,
    p_platform TEXT
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Don't unlink ratings, just remove the OAuth connection
    DELETE FROM medical.user_platform_identities
    WHERE user_id = p_user_id
    AND platform = p_platform;

    RETURN FOUND;
END;
$$;

-- Add view to see user's connected platforms
CREATE OR REPLACE VIEW medical.user_connected_platforms AS
SELECT 
    user_id,
    platform,
    platform_username,
    platform_email,
    token_expires_at < NOW() as is_token_expired,
    created_at as connected_at,
    updated_at as last_updated,
    EXISTS (
        SELECT 1 
        FROM medical.external_variable_ratings evr
        WHERE evr.platform = upi.platform
        AND evr.linked_user_id = upi.user_id
    ) as has_linked_ratings
FROM medical.user_platform_identities upi; 