"use server"

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import type { Database } from "@/lib/database.types";
import { startOfDay, endOfDay } from 'date-fns'; 
import type { ReminderNotificationDetails, ReminderNotificationStatus, VariableCategoryId } from "@/lib/database.types.custom";
import { revalidatePath } from 'next/cache';

// Define the type structure expected from the Supabase query with joins

// Intermediate type for the innermost part of global_variables
type FetchedGlobalVariableCore = Pick<Database['public']['Tables']['global_variables']['Row'], 'id' | 'name' | 'variable_category_id' | 'default_unit_id' | 'description' | 'emoji'>;
type FetchedGlobalVariableUnits = {
    default_unit: Pick<Database['public']['Tables']['units']['Row'], 'id' | 'abbreviated_name' | 'name'> | null;
    variable_categories: Pick<Database['public']['Tables']['variable_categories']['Row'], 'id' | 'name'> | null;
};

// Intermediate type for user_variables
type FetchedUserVariableCore = Pick<Database['public']['Tables']['user_variables']['Row'], 'id' | 'global_variable_id' | 'preferred_unit_id'>;
type FetchedUserVariableNested = {
    global_variables: (FetchedGlobalVariableCore & FetchedGlobalVariableUnits) | null;
    preferred_unit: Pick<Database['public']['Tables']['units']['Row'], 'id' | 'abbreviated_name' | 'name'> | null;
};

// Intermediate type for reminder_schedules
type FetchedReminderScheduleCore = Pick<Database['public']['Tables']['reminder_schedules']['Row'], 'id' | 'user_variable_id' | 'time_of_day' | 'default_value' | 'notification_title_template' | 'notification_message_template'>;
type FetchedReminderScheduleNested = {
    user_variables: (FetchedUserVariableCore & FetchedUserVariableNested) | null;
};

// Final FetchedNotification type
export type FetchedNotification = Database['public']['Tables']['reminder_notifications']['Row'] & {
    reminder_schedules: (FetchedReminderScheduleCore & FetchedReminderScheduleNested) | null;
};

/**
 * Fetches reminder notifications for a specific user and date to populate the timeline.
 * Returns data shaped as ReminderNotificationDetails.
 */
export async function getTimelineNotificationsForDateAction(
    userId: string,
  targetDate: Date
): Promise<{ success: boolean; data?: ReminderNotificationDetails[]; error?: string }> {
        const supabase = await createClient();
  const dateStr = targetDate.toISOString().split('T')[0];
  logger.info('Fetching timeline notifications for date', { userId, date: dateStr });

  const dayStart = startOfDay(targetDate).toISOString();
  const dayEnd = endOfDay(targetDate).toISOString();

  const { data: notifications, error } = await supabase
    .from('reminder_notifications')
    .select(`
      id,
      notification_trigger_at,
      status,
      log_details,
      reminder_schedule_id, 
      reminder_schedules!inner(
        id,
        user_variable_id,
        time_of_day,
        default_value,
        notification_title_template,
        notification_message_template,
        user_variables!inner(
            id,
            global_variable_id,
            preferred_unit_id,
            global_variables!inner(
                id,
                name,
                variable_category_id,
                description,
                emoji,
                default_unit_id,
                default_unit:units!global_variables_default_unit_id_fkey( id, name, abbreviated_name ),
                variable_categories( id, name )
            ),
            preferred_unit:units!user_variables_preferred_unit_id_fkey( id, name, abbreviated_name )
        )
      )
    `)
    .eq('user_id', userId)
    .gte('notification_trigger_at', dayStart)
    .lt('notification_trigger_at', dayEnd) 
    .order('notification_trigger_at', { ascending: true }); 

  if (error) {
    logger.error('Error fetching timeline notifications', { userId, date: dateStr, error });
    console.error("Supabase fetch error (timeline notifications):", JSON.stringify(error, null, 2));
    return { success: false, error: "Database error fetching timeline data." };
  }

  logger.debug("Raw notifications fetched from DB", { count: notifications?.length ?? 0, notifications: notifications?.map(n => ({id: n.id, triggerAt: n.notification_trigger_at, status: n.status})) });

  if (!notifications) {
    logger.info('No timeline notifications found for date', { userId, date: dateStr });
    return { success: true, data: [] };
  }

  const completedMeasurementIds = notifications
    .filter(n => n.status === 'completed' && n.log_details && (n.log_details as any).measurementId)
    .map(n => (n.log_details as any).measurementId as string);

  const linkedMeasurementsMap = new Map<string, number>();
  if (completedMeasurementIds.length > 0) {
    const { data: measurementsData, error: measurementsError } = await supabase
      .from('measurements')
      .select('id, value')
      .in('id', completedMeasurementIds)
      .eq('user_id', userId); 

    if (measurementsError) {
      logger.warn('Error fetching linked measurements for completed timeline items', { userId, date: dateStr, error: measurementsError });
    } else if (measurementsData) {
      measurementsData.forEach(m => {
        linkedMeasurementsMap.set(m.id, m.value);
      });
    }
  }

  const reminderDetailsItems: ReminderNotificationDetails[] = notifications.map((n): ReminderNotificationDetails | null => {
    const notification = n as FetchedNotification; 
    const schedule = notification.reminder_schedules;
    const userVar = schedule?.user_variables;
    const globalVar = userVar?.global_variables;
    const category = globalVar?.variable_categories;
    const preferredUnit = userVar?.preferred_unit;
    const defaultUnit = globalVar?.default_unit;
    const actualUnit = preferredUnit || defaultUnit;

    if (!schedule || !userVar || !globalVar || !category || !actualUnit) {
      logger.warn("Missing required nested data for reminder details, skipping notification", {
          notificationId: notification.id,
          scheduleMissing: !schedule,
          userVarMissing: !userVar,
          globalVarMissing: !globalVar,
          categoryMissing: !category,
          unitMissing: !actualUnit
      });
      return null; 
    }

    let displayValue: number | null = null;
    if (notification.status === 'completed' && notification.log_details) {
      const linkedMeasurementId = (notification.log_details as any)?.measurementId;
      if (linkedMeasurementId && linkedMeasurementsMap.has(linkedMeasurementId)) {
        displayValue = linkedMeasurementsMap.get(linkedMeasurementId)!;
      }
    }

    const variableCatId = category.id as VariableCategoryId;
    const notifStatus = notification.status as ReminderNotificationStatus;

    return {
      notificationId: notification.id,
      scheduleId: notification.reminder_schedule_id,
      userVariableId: userVar.id,
      variableName: globalVar.name, 
      globalVariableId: globalVar.id,
      variableCategory: variableCatId,
      unitId: actualUnit.id,
      unitName: actualUnit.name,
      dueAt: notification.notification_trigger_at,
      title: schedule.notification_title_template || globalVar.name,
      message: schedule.notification_message_template?.replace("{variableName}", globalVar.name) || globalVar.description || null,
      status: notifStatus,
      defaultValue: schedule.default_value, 
      emoji: globalVar.emoji,
      value: displayValue,
      isEditable: true,
    };
  }).filter((item): item is ReminderNotificationDetails => item !== null);

  logger.info(`Found and mapped ${reminderDetailsItems.length} reminder details items for date`, { userId, date: dateStr });
  return { success: true, data: reminderDetailsItems };
} 

// --- START of getPendingReminderNotificationsAction --- 
/**
 * Fetches PENDING reminder notifications for a user.
 */
export async function getPendingReminderNotificationsAction(
  userId: string
): Promise<ReminderNotificationDetails[]> { 
  const supabase = await createClient();
  logger.info('Fetching pending reminder notifications', { userId });

  const { data: notifications, error } = await supabase
    .from('reminder_notifications')
    .select(`
      id, 
      notification_trigger_at,
      status,
      reminder_schedules!inner(
        id,
        user_variable_id,
        default_value,
        notification_title_template,
        notification_message_template,
        user_variables!inner(
            global_variable_id,
            preferred_unit_id,
            global_variables!inner(
                name,
                variable_category_id,
                default_unit_id,
                emoji,
                default_unit:units!global_variables_default_unit_id_fkey( id, abbreviated_name, name ), 
                variable_categories!inner( id, name )
            ),
            preferred_unit:units!user_variables_preferred_unit_id_fkey( id, abbreviated_name, name )
        )
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'pending') 
    .order('notification_trigger_at', { ascending: true }); 

  if (error) {
    logger.error('Error fetching pending reminder notifications', { userId, error });
    console.error("Supabase fetch error (pending notifications):", JSON.stringify(error, null, 2));
    return []; 
  }

  if (!notifications) {
    return [];
  }

  const mappedNotifications: (ReminderNotificationDetails | null)[] = notifications
    .map(n => {
      const schedule = n.reminder_schedules as any; 
      const userVar = schedule?.user_variables as any;
      const globalVar = userVar?.global_variables as any;
      const category = globalVar?.variable_categories as any; 
      const preferredUnit = userVar?.preferred_unit as any;
      const defaultUnit = globalVar?.default_unit as any;

      const resolvedUnitId = preferredUnit?.id || defaultUnit?.id;
      const resolvedUnitName = preferredUnit?.abbreviated_name || defaultUnit?.abbreviated_name;

      if (!resolvedUnitId || !resolvedUnitName) {
        logger.warn('Skipping pending notification due to missing unit information (id or name)', { 
          notificationId: n.id, 
          resolvedUnitId, 
          resolvedUnitName 
        });
        return null; 
      }
      
      if (!category?.id) {
          logger.warn('Skipping pending notification due to missing variable category ID', { notificationId: n.id, category });
          return null; 
      }

      return {
          notificationId: n.id,
          scheduleId: schedule?.id || '',
          userVariableId: schedule?.user_variable_id || '',
          variableName: globalVar?.name || 'Unknown Item',
          globalVariableId: userVar?.global_variable_id || '',
          // Ensure this cast is to the correct VariableCategoryId type if ReminderNotificationDetails expects it
          variableCategory: category.id as ReminderNotificationDetails['variableCategory'], 
          unitId: resolvedUnitId,
          unitName: resolvedUnitName,
          dueAt: n.notification_trigger_at as string,
          title: schedule?.notification_title_template || null,
          message: schedule?.notification_message_template || null,
          // Ensure this cast is to the correct ReminderNotificationStatus type
          status: n.status as ReminderNotificationDetails['status'], 
          defaultValue: schedule?.default_value,       
          emoji: globalVar?.emoji,                   
      };
    });

  const tasks: ReminderNotificationDetails[] = mappedNotifications
    .filter((task): task is ReminderNotificationDetails => {
      if (task === null) return false;
      return typeof task.notificationId === 'string' && 
             typeof task.unitId === 'string' && 
             typeof task.unitName === 'string' &&
             typeof task.variableCategory === 'string';
    });

  logger.info(`Found ${tasks.length} pending reminder notifications`, { userId });
  return tasks;
}
// --- END of getPendingReminderNotificationsAction --- 

// --- START of completeReminderNotificationAction ---
/**
 * Updates the status of a specific reminder notification.
 */
export async function completeReminderNotificationAction(
   notificationId: string, 
   userId: string, 
   skipped: boolean = false,
   logDetails?: any 
): Promise<{ success: boolean; error?: string; }> { 
   const supabase = await createClient();
   const newStatus = skipped ? 'skipped' : 'completed';
   logger.info('Completing reminder notification', { notificationId, userId, newStatus, logDetails });

   try {
        const updateData: Partial<Database['public']['Tables']['reminder_notifications']['Update']> = {
            status: newStatus,
            completed_or_skipped_at: new Date().toISOString(),
            log_details: logDetails || null
        };

        const { error } = await supabase
            .from('reminder_notifications')
            .update(updateData)
            .eq('id', notificationId)
            .eq('user_id', userId)
            .eq('status', 'pending');

        if (error) {
            logger.error("Error updating reminder notification status", { notificationId, userId, error });
            if (error.code === 'PGRST116') { 
                 return { success: false, error: "Notification might have already been processed." };
            }
            return { success: false, error: "Could not update the notification status." };
        }
        
        revalidatePath(`/components/patient/TrackingInbox`); // This path might not be ideal for revalidation
        revalidatePath(`/patient/dashboard`);

        logger.info("Reminder notification completed successfully", { notificationId, newStatus });
        return { success: true }; 

   } catch (error) {
       logger.error('Failed in completeReminderNotificationAction', { notificationId, error: error instanceof Error ? error.message : String(error) });
       return { success: false, error: error instanceof Error ? error.message : "An unknown error occurred." };
   }
} 
// --- END of completeReminderNotificationAction --- 

// Interface for a generic action result
interface ActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

/**
 * Creates a measurement and then completes the associated reminder notification.
 */
export async function createMeasurementAndCompleteNotificationAction(params: {
  userId: string;
  globalVariableId: string;
  value: number;
  unitId: string;
  notificationId: string;
  scheduleId: string; // Though not directly used in this action currently, kept for consistency with prior thinking
  notes?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  logger.info('createMeasurementAndCompleteNotificationAction called', params);

  try {
    // Step 1: Create the measurement
    const measurementToInsert = {
      user_id: params.userId,
      global_variable_id: params.globalVariableId,
      value: params.value,
      unit_id: params.unitId,
      notes: params.notes,
      start_at: new Date().toISOString(), // Or use notification.dueAt if preferred
      measurement_type: 'self_reported', // Or a more specific type like 'notification_log'
      reminder_notification_id: params.notificationId, // Optional: if you have a direct link
    };

    const { data: newMeasurement, error: measurementError } = await supabase
      .from('measurements')
      .insert(measurementToInsert)
      .select('id')
      .single();

    if (measurementError) {
      logger.error('Error creating measurement from notification', { ...params, error: measurementError });
      return { success: false, error: measurementError.message || "Failed to create measurement." };
    }
    if (!newMeasurement) {
        logger.error('No measurement data returned after insert', params);
        return { success: false, error: "Failed to create measurement (no data returned)." };
    }

    logger.info('Measurement created from notification', { measurementId: newMeasurement.id, notificationId: params.notificationId });

    // Step 2: Complete the notification, linking the measurement
    const completeResult = await completeReminderNotificationAction(
      params.notificationId,
      params.userId,
      false, // skipped = false
      { measurementId: newMeasurement.id, loggedValue: params.value } // logDetails
    );

    if (!completeResult.success) {
      // Note: Measurement was created. Consider compensation logic if critical (e.g., delete measurement).
      // For now, we'll just report the error from completing the notification.
      logger.error('Measurement created, but failed to complete notification', { ...params, measurementId: newMeasurement.id, error: completeResult.error });
      return { success: false, error: completeResult.error || "Measurement logged, but failed to update notification status." };
    }

    // Revalidate paths after successful operation
    revalidatePath('/patient/dashboard'); // Revalidate the main dashboard
    // Add other relevant paths, e.g., a page listing all measurements
    // revalidatePath('/patient/measurements'); 

    return { success: true, data: { measurementId: newMeasurement.id } };

  } catch (error) {
    logger.error('Unexpected error in createMeasurementAndCompleteNotificationAction', { ...params, error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: error instanceof Error ? error.message : "An unknown server error occurred." };
  }
}

/**
 * Reverts a completed or skipped notification back to pending.
 */
export async function undoNotificationAction(params: {
  notificationId: string;
  userId: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  logger.info('undoNotificationAction called', params);

  try {
    // Optionally, fetch the notification first if you need to inspect log_details
    // to delete/disassociate a linked measurement. For simplicity, we'll just update status and clear details here.
    /*
    const { data: currentNotification, error: fetchError } = await supabase
      .from('reminder_notifications')
      .select('log_details')
      .eq('id', params.notificationId)
      .eq('user_id', params.userId)
      .single();

    if (fetchError) {
      logger.warn('Could not fetch notification before undo', { ...params, error: fetchError });
      // Decide if this is a hard stop or if we proceed with the update anyway
    }
    // if (currentNotification && currentNotification.log_details?.measurementId) {
    //   // TODO: Optionally delete the measurement with currentNotification.log_details.measurementId
    // }
    */

    const updateData = {
      status: 'pending' as ReminderNotificationStatus, // Explicitly cast for safety
      completed_or_skipped_at: null,
      log_details: null,
    };

    const { error: updateError } = await supabase
      .from('reminder_notifications')
      .update(updateData)
      .eq('id', params.notificationId)
      .eq('user_id', params.userId);
      // Potentially add a condition: .in('status', ['completed', 'skipped']) to only undo if not already pending

    if (updateError) {
      logger.error('Error undoing notification status', { ...params, error: updateError });
      return { success: false, error: updateError.message || "Failed to undo notification status." };
    }

    // Revalidate paths
    revalidatePath('/patient/dashboard');
    // revalidatePath('/patient/measurements'); 

    return { success: true };

  } catch (error) {
    logger.error('Unexpected error in undoNotificationAction', { ...params, error: error instanceof Error ? error.message : String(error) });
    return { success: false, error: error instanceof Error ? error.message : "An unknown server error occurred." };
  }
}