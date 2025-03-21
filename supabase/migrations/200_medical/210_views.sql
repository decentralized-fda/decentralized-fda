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

-- View for upcoming notifications with channel info
CREATE OR REPLACE VIEW medical.upcoming_notifications AS
SELECT 
    pn.id,
    pn.user_id,
    pn.global_variable_id,
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
GROUP BY pn.id, pn.user_id, pn.global_variable_id, pn.scheduled_for, p.timezone, 
         pn.status, pn.last_value, pn.last_unit_id, mr.reminder_name; 