-- Upcoming Notifications View
--
-- Provides a consolidated view of upcoming notifications with their channel information
-- and delivery status.
--
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