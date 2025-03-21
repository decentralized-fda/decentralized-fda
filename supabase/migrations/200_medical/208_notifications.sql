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
    contact_value TEXT NOT NULL,
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
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    reminder_name TEXT,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
    custom_cron TEXT,
    time_of_day TIME[],
    days_of_week INTEGER[] CHECK (array_length(days_of_week, 1) IS NULL OR 
        (SELECT bool_and(d BETWEEN 0 AND 6) FROM unnest(days_of_week) AS d)),
    day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    skip_weekends BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, global_variable_id, reminder_name)
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
    global_variable_id UUID NOT NULL REFERENCES medical_ref.global_variables(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'skipped', 'completed')),
    response_value DECIMAL,
    response_unit_id UUID REFERENCES medical_ref.units_of_measurement(id),
    response_time TIMESTAMPTZ,
    skip_reason TEXT,
    last_value DECIMAL,
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
    external_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE medical.notification_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.measurement_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.reminder_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.pending_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical.notification_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies
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