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
    preferred_unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
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

-- Add timezone to user profiles if not exists
ALTER TABLE core.profiles 
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';

-- Notification channel preferences
CREATE TABLE medical.notification_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    channel_type TEXT NOT NULL CHECK (channel_type IN (
        'sms', 'whatsapp', 'telegram', 'email', 'phone_call', 'in_app'
    )),
    is_enabled BOOLEAN DEFAULT true,
    contact_value TEXT NOT NULL, -- phone number or email or telegram ID etc.
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'failed')),
    verification_code TEXT,
    verification_expires_at TIMESTAMPTZ,
    last_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, channel_type, contact_value)
);

-- Measurement reminder settings
CREATE TABLE medical.measurement_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    reminder_name TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
    custom_cron TEXT, -- For custom schedules
    time_of_day TIME[], -- Array of times to remind
    days_of_week INTEGER[] CHECK (array_length(days_of_week, 1) IS NULL OR 
        (SELECT bool_and(d BETWEEN 0 AND 6) FROM unnest(days_of_week) AS d)),
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    skip_weekends BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, variable_id, reminder_name)
);

-- Channel settings for each reminder
CREATE TABLE medical.reminder_channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reminder_id UUID NOT NULL REFERENCES medical.measurement_reminders(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES medical.notification_channels(id) ON DELETE CASCADE,
    is_enabled BOOLEAN DEFAULT true,
    retry_count INTEGER DEFAULT 0,
    retry_interval INTERVAL DEFAULT '1 hour',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(reminder_id, channel_id)
);

-- Pending notifications (the "inbox")
CREATE TABLE medical.pending_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    reminder_id UUID NOT NULL REFERENCES medical.measurement_reminders(id) ON DELETE CASCADE,
    variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped', 'completed')),
    response_value DECIMAL,
    response_unit_id UUID REFERENCES medical_ref.units_of_measurement(id),
    response_time TIMESTAMPTZ,
    skip_reason TEXT,
    last_value DECIMAL, -- Most recent value for quick response
    last_unit_id UUID REFERENCES medical_ref.units_of_measurement(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification delivery attempts
CREATE TABLE medical.notification_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    notification_id UUID NOT NULL REFERENCES medical.pending_notifications(id) ON DELETE CASCADE,
    channel_id UUID NOT NULL REFERENCES medical.notification_channels(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    external_id TEXT, -- ID from notification service
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- View for upcoming notifications with channel info
CREATE OR REPLACE VIEW medical.upcoming_notifications AS
SELECT 
    pn.id,
    pn.user_id,
    pn.variable_id,
    pn.scheduled_for AT TIME ZONE p.timezone as local_scheduled_time,
    pn.status,
    pn.last_value,
    pn.last_unit_id,
    mr.reminder_name,
    array_agg(DISTINCT nc.channel_type) as channels,
    COUNT(DISTINCT na.id) FILTER (WHERE na.status = 'failed') as failed_attempts,
    bool_or(na.status = 'delivered') as any_delivered
FROM medical.pending_notifications pn
JOIN core.profiles p ON pn.user_id = p.id
JOIN medical.measurement_reminders mr ON pn.reminder_id = mr.id
JOIN medical.reminder_channels rc ON mr.id = rc.reminder_id
JOIN medical.notification_channels nc ON rc.channel_id = nc.id
LEFT JOIN medical.notification_attempts na ON pn.id = na.notification_id
WHERE pn.status IN ('pending', 'sent')
GROUP BY pn.id, pn.user_id, pn.variable_id, pn.scheduled_for, p.timezone, 
         pn.status, pn.last_value, pn.last_unit_id, mr.reminder_name;

-- Function to record measurement from notification
CREATE OR REPLACE FUNCTION medical.record_notification_measurement(
    p_notification_id UUID,
    p_value DECIMAL,
    p_unit_id UUID,
    p_apply_to_previous BOOLEAN DEFAULT false
)
RETURNS TABLE (
    notifications_updated INTEGER,
    measurements_created INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_variable_id UUID;
    v_notifications_updated INTEGER := 0;
    v_measurements_created INTEGER := 0;
BEGIN
    -- Get notification details
    SELECT user_id, variable_id INTO v_user_id, v_variable_id
    FROM medical.pending_notifications
    WHERE id = p_notification_id;

    -- Update this notification
    UPDATE medical.pending_notifications
    SET 
        status = 'completed',
        response_value = p_value,
        response_unit_id = p_unit_id,
        response_time = NOW(),
        updated_at = NOW()
    WHERE id = p_notification_id;

    GET DIAGNOSTICS v_notifications_updated = ROW_COUNT;

    -- If requested, update all previous pending notifications for this variable
    IF p_apply_to_previous THEN
        UPDATE medical.pending_notifications
        SET 
            status = 'completed',
            response_value = p_value,
            response_unit_id = p_unit_id,
            response_time = NOW(),
            updated_at = NOW()
        WHERE user_id = v_user_id
        AND variable_id = v_variable_id
        AND status = 'pending'
        AND scheduled_for < (SELECT scheduled_for FROM medical.pending_notifications WHERE id = p_notification_id);

        GET DIAGNOSTICS v_notifications_updated = v_notifications_updated + ROW_COUNT;
    END IF;

    -- Create measurements for all completed notifications using store_measurement
    INSERT INTO medical.variable_measurements (
        id,
        user_id,
        variable_id,
        value,
        unit_id,
        original_value,
        original_unit_id,
        measurement_time,
        source,
        notes
    )
    SELECT 
        medical.store_measurement(
            pn.user_id,
            pn.variable_id,
            pn.response_value,
            pn.response_unit_id,
            pn.scheduled_for,
            'notification_response',
            'Recorded from notification ID: ' || pn.id::text
        ),
        pn.user_id,
        pn.variable_id,
        pn.response_value,
        pn.response_unit_id,
        pn.response_value,
        pn.response_unit_id,
        pn.scheduled_for,
        'notification_response',
        'Recorded from notification ID: ' || pn.id::text
    FROM medical.pending_notifications pn
    WHERE pn.id IN (
        SELECT id FROM medical.pending_notifications
        WHERE user_id = v_user_id
        AND variable_id = v_variable_id
        AND status = 'completed'
        AND response_time = NOW()
    );

    GET DIAGNOSTICS v_measurements_created = ROW_COUNT;

    RETURN QUERY SELECT v_notifications_updated, v_measurements_created;
END;
$$;

-- Function to skip notifications
CREATE OR REPLACE FUNCTION medical.skip_notifications(
    p_notification_id UUID,
    p_skip_reason TEXT,
    p_skip_previous BOOLEAN DEFAULT false
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_variable_id UUID;
    v_skipped_count INTEGER;
BEGIN
    -- Get notification details
    SELECT user_id, variable_id INTO v_user_id, v_variable_id
    FROM medical.pending_notifications
    WHERE id = p_notification_id;

    -- Update this notification
    UPDATE medical.pending_notifications
    SET 
        status = 'skipped',
        skip_reason = p_skip_reason,
        updated_at = NOW()
    WHERE id = p_notification_id;

    -- If requested, skip all previous pending notifications for this variable
    IF p_skip_previous THEN
        UPDATE medical.pending_notifications
        SET 
            status = 'skipped',
            skip_reason = p_skip_reason,
            updated_at = NOW()
        WHERE user_id = v_user_id
        AND variable_id = v_variable_id
        AND status = 'pending'
        AND scheduled_for < (SELECT scheduled_for FROM medical.pending_notifications WHERE id = p_notification_id);
    END IF;

    GET DIAGNOSTICS v_skipped_count = ROW_COUNT;
    RETURN v_skipped_count;
END;
$$;

-- Function to generate notifications (to be called by application scheduler)
CREATE OR REPLACE FUNCTION medical.generate_notifications(
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ
)
RETURNS TABLE (
    notifications_created INTEGER,
    users_affected INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_notifications_created INTEGER := 0;
    v_users_affected INTEGER := 0;
BEGIN
    -- Create notifications for all active reminders in the time range
    WITH inserted_notifications AS (
        INSERT INTO medical.pending_notifications (
            user_id,
            reminder_id,
            variable_id,
            scheduled_for,
            last_value,
            last_unit_id
        )
        SELECT DISTINCT
            mr.user_id,
            mr.id,
            mr.variable_id,
            -- Calculate notification times based on reminder settings
            date_trunc('hour', ts) + 
                make_interval(mins => EXTRACT(MINUTE FROM unnest(mr.time_of_day))::int) AS scheduled_for,
            -- Get last value for quick response
            (
                SELECT value 
                FROM medical.variable_measurements vm
                WHERE vm.user_id = mr.user_id
                AND vm.variable_id = mr.variable_id
                ORDER BY measurement_time DESC
                LIMIT 1
            ) as last_value,
            (
                SELECT unit_id 
                FROM medical.variable_measurements vm
                WHERE vm.user_id = mr.user_id
                AND vm.variable_id = mr.variable_id
                ORDER BY measurement_time DESC
                LIMIT 1
            ) as last_unit_id
        FROM medical.measurement_reminders mr
        CROSS JOIN generate_series(
            p_start_time,
            p_end_time,
            '1 hour'::interval
        ) AS ts
        WHERE mr.is_active = true
        AND CURRENT_DATE BETWEEN mr.start_date AND COALESCE(mr.end_date, CURRENT_DATE + '100 years'::interval)
        AND (
            -- Daily reminders
            (mr.frequency = 'daily' AND (NOT mr.skip_weekends OR EXTRACT(DOW FROM ts) NOT IN (0, 6)))
            OR
            -- Weekly reminders
            (mr.frequency = 'weekly' AND EXTRACT(DOW FROM ts) = ANY(mr.days_of_week))
            OR
            -- Monthly reminders
            (mr.frequency = 'monthly' AND EXTRACT(DAY FROM ts) = mr.day_of_month)
            OR
            -- Custom cron schedule
            (mr.frequency = 'custom' AND ts::text ~ mr.custom_cron)
        )
        ON CONFLICT (user_id, reminder_id, scheduled_for) DO NOTHING
        RETURNING user_id
    )
    SELECT 
        COUNT(*),
        COUNT(DISTINCT user_id)
    INTO v_notifications_created, v_users_affected
    FROM inserted_notifications;

    RETURN QUERY SELECT v_notifications_created, v_users_affected;
END;
$$;

-- Enable RLS
ALTER TABLE medical.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.measurement_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.reminder_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.pending_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.notification_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their notification channels"
    ON medical.notification_channels FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their notification channels"
    ON medical.notification_channels FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their reminders"
    ON medical.measurement_reminders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their reminders"
    ON medical.measurement_reminders FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their reminder channels"
    ON medical.reminder_channels FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM medical.measurement_reminders mr
        WHERE mr.id = reminder_id AND mr.user_id = auth.uid()
    ));

CREATE POLICY "Users can manage their reminder channels"
    ON medical.reminder_channels FOR ALL
    USING (EXISTS (
        SELECT 1 FROM medical.measurement_reminders mr
        WHERE mr.id = reminder_id AND mr.user_id = auth.uid()
    ));

CREATE POLICY "Users can view their notifications"
    ON medical.pending_notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
    ON medical.pending_notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
    ON medical.pending_notifications FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Users can view their notification attempts"
    ON medical.notification_attempts FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM medical.pending_notifications pn
        WHERE pn.id = notification_id AND pn.user_id = auth.uid()
    ));

-- Add default unit to global variables if not exists
ALTER TABLE medical_ref.global_variables 
ADD COLUMN IF NOT EXISTS default_unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT;

-- Function to convert value between units
CREATE OR REPLACE FUNCTION medical.convert_unit_value(
    p_value DECIMAL,
    p_from_unit_id UUID,
    p_to_unit_id UUID
)
RETURNS DECIMAL
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_from_unit_type TEXT;
    v_to_unit_type TEXT;
    v_from_multiplier DECIMAL;
    v_to_multiplier DECIMAL;
    v_converted_value DECIMAL;
BEGIN
    -- Get unit types and multipliers
    SELECT um1.unit_type, um1.conversion_multiplier, um2.unit_type, um2.conversion_multiplier
    INTO v_from_unit_type, v_from_multiplier, v_to_unit_type, v_to_multiplier
    FROM medical_ref.units_of_measurement um1
    JOIN medical_ref.units_of_measurement um2 ON um2.id = p_to_unit_id
    WHERE um1.id = p_from_unit_id;

    -- Check if units are compatible
    IF v_from_unit_type != v_to_unit_type THEN
        RAISE EXCEPTION 'Cannot convert between incompatible units: % and %', v_from_unit_type, v_to_unit_type;
    END IF;

    -- Convert to base unit then to target unit
    v_converted_value := (p_value * v_from_multiplier) / v_to_multiplier;

    RETURN v_converted_value;
END;
$$;

-- Function to store measurement with automatic unit conversion
CREATE OR REPLACE FUNCTION medical.store_measurement(
    p_user_id UUID,
    p_variable_id UUID,
    p_value DECIMAL,
    p_unit_id UUID,
    p_measurement_time TIMESTAMPTZ DEFAULT NOW(),
    p_source TEXT DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_is_estimated BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_target_unit_id UUID;
    v_converted_value DECIMAL;
    v_measurement_id UUID;
BEGIN
    -- Get the target unit (user's preferred unit or global default)
    SELECT COALESCE(
        uv.preferred_unit_id,
        gv.default_unit_id
    ) INTO v_target_unit_id
    FROM medical_ref.global_variables gv
    LEFT JOIN medical.user_variables uv 
        ON uv.global_variable_id = gv.id 
        AND uv.user_id = p_user_id
    WHERE gv.id = p_variable_id;

    -- If no target unit is set, use the provided unit
    IF v_target_unit_id IS NULL THEN
        v_target_unit_id := p_unit_id;
    END IF;

    -- Convert value if units are different
    IF p_unit_id != v_target_unit_id THEN
        v_converted_value := medical.convert_unit_value(p_value, p_unit_id, v_target_unit_id);
    ELSE
        v_converted_value := p_value;
    END IF;

    -- Store the measurement
    INSERT INTO medical.variable_measurements (
        user_id,
        variable_id,
        value,
        unit_id,
        original_value,
        original_unit_id,
        measurement_time,
        source,
        notes,
        is_estimated
    ) VALUES (
        p_user_id,
        p_variable_id,
        v_converted_value,
        v_target_unit_id,
        p_value,
        p_unit_id,
        p_measurement_time,
        p_source,
        p_notes,
        p_is_estimated
    )
    RETURNING id INTO v_measurement_id;

    RETURN v_measurement_id;
END;
$$;

-- Add columns to store original values
ALTER TABLE medical.variable_measurements
ADD COLUMN IF NOT EXISTS original_value DECIMAL,
ADD COLUMN IF NOT EXISTS original_unit_id UUID REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT;

-- Add essential columns to base table
ALTER TABLE medical.user_variable_relationships
ADD COLUMN onset_delay interval NOT NULL DEFAULT '0'::interval 
    COMMENT 'Time after cause measurement before a perceivable effect is observed',
ADD COLUMN duration_of_action interval NOT NULL DEFAULT '1 day'::interval 
    COMMENT 'Time over which the cause is expected to produce an effect',
ADD COLUMN relationship varchar(8) CHECK (relationship IN ('POSITIVE', 'NEGATIVE', 'NONE')),
ADD COLUMN confidence_level varchar(6) CHECK (confidence_level IN ('HIGH', 'MEDIUM', 'LOW')),
ADD COLUMN strength_level varchar(11) CHECK (strength_level IN ('VERY STRONG', 'STRONG', 'MODERATE', 'WEAK', 'VERY WEAK')),
ADD COLUMN is_public boolean DEFAULT false,
ADD COLUMN plausibly_causal boolean,
ADD COLUMN predictor_is_controllable boolean,
ADD COLUMN outcome_is_goal boolean,
ADD COLUMN usefulness_vote integer CHECK (usefulness_vote BETWEEN -1 AND 1),
ADD COLUMN causality_vote integer CHECK (causality_vote BETWEEN -1 AND 1),
ADD COLUMN deleted_at timestamp;

-- Create materialized view for variable relationship statistics
CREATE MATERIALIZED VIEW medical.user_variable_relationship_stats AS
WITH measurement_stats AS (
    SELECT 
        r.id as relationship_id,
        r.cause_variable_id,
        r.effect_variable_id,
        COUNT(DISTINCT m.id) as number_of_pairs,
        COUNT(DISTINCT DATE(m.timestamp)) as number_of_days,
        AVG(CASE WHEN m.value > avg_m.avg_value THEN m.value END) as average_high_cause,
        AVG(CASE WHEN m.value < avg_m.avg_value THEN m.value END) as average_low_cause,
        AVG(m.value) as average_effect,
        STDDEV(m.value) as effect_baseline_standard_deviation,
        MIN(m.timestamp) as earliest_measurement_start_at,
        MAX(m.timestamp) as latest_measurement_start_at
    FROM medical.user_variable_relationships r
    JOIN medical.variable_measurements m ON m.variable_id = r.effect_variable_id
    CROSS JOIN (
        SELECT variable_id, AVG(value) as avg_value 
        FROM medical.variable_measurements 
        GROUP BY variable_id
    ) avg_m ON avg_m.variable_id = m.variable_id
    GROUP BY r.id, r.cause_variable_id, r.effect_variable_id
),
correlation_calcs AS (
    SELECT 
        ms.*,
        corr(c.value, e.value) as forward_pearson_correlation_coefficient,
        corr(e.value, c_prev.value) as reverse_pearson_correlation_coefficient,
        -- Statistical significance calculations
        CASE 
            WHEN ABS(corr(c.value, e.value)) * SQRT(COUNT(*) - 2) / 
                SQRT(1 - POWER(corr(c.value, e.value), 2)) > 1.96 
            THEN true 
            ELSE false 
        END as is_statistically_significant
    FROM measurement_stats ms
    JOIN medical.variable_measurements c ON c.variable_id = ms.cause_variable_id
    JOIN medical.variable_measurements e ON e.variable_id = ms.effect_variable_id 
        AND e.timestamp > c.timestamp 
        AND e.timestamp <= c.timestamp + INTERVAL '1 day'
    LEFT JOIN medical.variable_measurements c_prev ON c_prev.variable_id = ms.cause_variable_id
        AND c_prev.timestamp < e.timestamp
    GROUP BY ms.relationship_id, ms.cause_variable_id, ms.effect_variable_id,
             ms.number_of_pairs, ms.number_of_days, ms.average_high_cause,
             ms.average_low_cause, ms.average_effect, ms.effect_baseline_standard_deviation,
             ms.earliest_measurement_start_at, ms.latest_measurement_start_at
)
SELECT 
    cc.*,
    CASE
        WHEN ABS(forward_pearson_correlation_coefficient) > 0.6 THEN 'VERY STRONG'
        WHEN ABS(forward_pearson_correlation_coefficient) > 0.4 THEN 'STRONG'
        WHEN ABS(forward_pearson_correlation_coefficient) > 0.2 THEN 'MODERATE'
        WHEN ABS(forward_pearson_correlation_coefficient) > 0.1 THEN 'WEAK'
        ELSE 'VERY WEAK'
    END as calculated_strength_level,
    CASE
        WHEN number_of_pairs > 100 AND is_statistically_significant THEN 'HIGH'
        WHEN number_of_pairs > 30 AND is_statistically_significant THEN 'MEDIUM'
        ELSE 'LOW'
    END as calculated_confidence_level,
    CASE
        WHEN forward_pearson_correlation_coefficient > 0 THEN 'POSITIVE'
        WHEN forward_pearson_correlation_coefficient < 0 THEN 'NEGATIVE'
        ELSE 'NONE'
    END as calculated_relationship
FROM correlation_calcs cc;

-- Create index for better performance
CREATE INDEX ON medical.user_variable_relationship_stats (relationship_id);

-- Create refresh function
CREATE OR REPLACE FUNCTION medical.refresh_relationship_stats()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY medical.user_variable_relationship_stats;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh stats when measurements are updated
CREATE OR REPLACE FUNCTION medical.trigger_refresh_relationship_stats()
RETURNS trigger AS $$
BEGIN
    PERFORM medical.refresh_relationship_stats();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER refresh_relationship_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON medical.variable_measurements
FOR EACH STATEMENT EXECUTE FUNCTION medical.trigger_refresh_relationship_stats(); 