-- Create schema for communication management
CREATE TABLE IF NOT EXISTS medical.communication_preferences (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    channel text NOT NULL CHECK (channel IN ('sms', 'voice_call', 'email', 'push_notification')),
    contact_value text NOT NULL,
    is_verified boolean DEFAULT false,
    verification_code text,
    verification_expires_at timestamptz,
    preferred_time_start time,
    preferred_time_end time,
    preferred_days text[] CHECK (array_length(preferred_days, 1) IS NULL OR 
        array(SELECT unnest(preferred_days) INTERSECT SELECT unnest(ARRAY['MON','TUE','WED','THU','FRI','SAT','SUN'])) = preferred_days),
    timezone text DEFAULT 'UTC',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, channel, contact_value)
);

CREATE TABLE IF NOT EXISTS medical.check_in_schedules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id uuid NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    frequency text NOT NULL CHECK (frequency IN ('daily', 'weekly', 'custom')),
    custom_schedule jsonb, -- For complex scheduling patterns
    variables_to_track uuid[] NOT NULL, -- Array of global_variable_ids to ask about
    question_template jsonb NOT NULL, -- Customizable questions/prompts
    preferred_channel text NOT NULL REFERENCES medical.communication_preferences(channel),
    is_ai_enabled boolean DEFAULT true,
    max_attempts integer DEFAULT 3,
    retry_interval interval DEFAULT '1 hour',
    start_date date NOT NULL,
    end_date date,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical.check_in_sessions (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id uuid NOT NULL REFERENCES medical.check_in_schedules(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES core.profiles(id) ON DELETE CASCADE,
    session_start timestamptz NOT NULL DEFAULT now(),
    session_end timestamptz,
    channel text NOT NULL,
    status text NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'cancelled')),
    attempt_count integer DEFAULT 1,
    next_attempt_at timestamptz,
    ai_agent_id text, -- Reference to the AI agent handling the session
    session_data jsonb, -- Stores conversation context and collected data
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medical.check_in_responses (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id uuid NOT NULL REFERENCES medical.check_in_sessions(id) ON DELETE CASCADE,
    variable_id uuid NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    response_type text NOT NULL CHECK (response_type IN ('measurement', 'rating', 'text')),
    raw_response text NOT NULL,
    parsed_value decimal,
    unit_id uuid REFERENCES medical_ref.units_of_measurement(id) ON DELETE RESTRICT,
    confidence_score decimal CHECK (confidence_score BETWEEN 0 AND 1),
    requires_review boolean DEFAULT false,
    reviewed_by uuid REFERENCES core.profiles(id) ON DELETE SET NULL,
    review_notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create trigger function to process check-in responses
CREATE OR REPLACE FUNCTION medical.process_check_in_response()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    -- Insert into appropriate table based on response_type
    CASE NEW.response_type
        WHEN 'measurement' THEN
            IF NEW.parsed_value IS NOT NULL THEN
                INSERT INTO medical.variable_measurements (
                    user_id,
                    variable_id,
                    value,
                    unit_id,
                    measurement_time,
                    source,
                    notes,
                    is_estimated
                )
                SELECT
                    cs.user_id,
                    NEW.variable_id,
                    NEW.parsed_value,
                    NEW.unit_id,
                    cs.session_start,
                    'check_in',
                    NEW.raw_response,
                    NEW.confidence_score < 0.9
                FROM medical.check_in_sessions cs
                WHERE cs.id = NEW.session_id;
            END IF;

        WHEN 'rating' THEN
            -- Convert text responses to ratings
            INSERT INTO medical.variable_ratings (
                user_id,
                predictor_variable_id,
                outcome_variable_id,
                effectiveness_rating,
                numeric_rating,
                review_text,
                is_public,
                is_verified
            )
            SELECT
                cs.user_id,
                gv.id as predictor_variable_id,
                NEW.variable_id as outcome_variable_id,
                CASE 
                    WHEN NEW.parsed_value <= 1 THEN 'much_worse'
                    WHEN NEW.parsed_value <= 2 THEN 'worse'
                    WHEN NEW.parsed_value <= 3 THEN 'no_effect'
                    WHEN NEW.parsed_value <= 4 THEN 'better'
                    ELSE 'much_better'
                END,
                NEW.parsed_value::integer,
                NEW.raw_response,
                false,
                NEW.confidence_score > 0.9
            FROM medical.check_in_sessions cs
            CROSS JOIN medical_ref.global_variables gv
            WHERE cs.id = NEW.session_id
            AND gv.name = 'check_in_response'
            ON CONFLICT (user_id, predictor_variable_id, outcome_variable_id) 
            DO UPDATE SET
                effectiveness_rating = EXCLUDED.effectiveness_rating,
                numeric_rating = EXCLUDED.numeric_rating,
                review_text = EXCLUDED.review_text,
                updated_at = now();
    END CASE;
    
    RETURN NEW;
END;
$$;

-- Create trigger for automatic response processing
CREATE TRIGGER process_check_in_response_trigger
    AFTER INSERT OR UPDATE ON medical.check_in_responses
    FOR EACH ROW
    EXECUTE FUNCTION medical.process_check_in_response();

-- Add RLS policies
ALTER TABLE medical.communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.check_in_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.check_in_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.check_in_responses ENABLE ROW LEVEL SECURITY;

-- Users can view their own data
CREATE POLICY "Users can view their own communication preferences"
    ON medical.communication_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own communication preferences"
    ON medical.communication_preferences FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own check-in schedules"
    ON medical.check_in_schedules FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own check-in schedules"
    ON medical.check_in_schedules FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own check-in sessions"
    ON medical.check_in_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can manage check-in sessions"
    ON medical.check_in_sessions FOR ALL
    USING (true);

CREATE POLICY "Users can view their own check-in responses"
    ON medical.check_in_responses FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM medical.check_in_sessions cs
        WHERE cs.id = session_id AND cs.user_id = auth.uid()
    ));

-- Function to schedule next check-in
CREATE OR REPLACE FUNCTION medical.schedule_next_check_in(schedule_id uuid)
RETURNS timestamptz
LANGUAGE plpgsql
AS $$
DECLARE
    next_time timestamptz;
BEGIN
    -- Calculate next check-in time based on schedule settings
    SELECT
        CASE
            WHEN cis.frequency = 'daily' THEN
                now() + interval '1 day'
            WHEN cis.frequency = 'weekly' THEN
                now() + interval '7 days'
            ELSE
                -- Handle custom schedule
                (cis.custom_schedule->>'next_date')::timestamptz
        END
    INTO next_time
    FROM medical.check_in_schedules cis
    WHERE cis.id = schedule_id;

    -- Create next session
    INSERT INTO medical.check_in_sessions (
        schedule_id,
        user_id,
        channel,
        status
    )
    SELECT
        cis.id,
        cis.user_id,
        cis.preferred_channel,
        'scheduled'
    FROM medical.check_in_schedules cis
    WHERE cis.id = schedule_id
    AND cis.is_active = true;

    RETURN next_time;
END;
$$; 