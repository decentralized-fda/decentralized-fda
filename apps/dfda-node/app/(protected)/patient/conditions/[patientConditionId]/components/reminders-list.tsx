import { rrulestr } from 'rrule'
import { ReminderSchedule } from "@/lib/actions/reminder-schedules"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createLogger } from "@/lib/logger"

const logger = createLogger("reminders-list")

interface RemindersListProps {
  reminders: ReminderSchedule[]
  conditionName?: string | null
  unitName?: string | null
}

/**
 * Displays a list of reminder schedules with their details in a card layout.
 *
 * If no reminders are provided, shows a message indicating no reminders found for the specified condition.
 *
 * @param reminders - The array of reminder schedules to display
 * @param conditionName - The name of the condition associated with the reminders, if any
 * @param unitName - The unit name to display with default values, if provided
 * @returns A React element rendering the list of reminders or a message if none are found
 */
export function RemindersList({ reminders, conditionName, unitName }: RemindersListProps) {
  if (!reminders || reminders.length === 0) {
    return <p className="text-sm text-muted-foreground">No reminders found for {conditionName || "this condition"}.</p>
  }

  const formatRRule = (rruleString: string): string => {
    try {
      const rule = rrulestr(rruleString)
      return rule.toText()
    } catch (e) {
      logger.warn("Failed to parse RRULE string in RemindersList", { rruleString, error: (e as Error)?.message });
      return "Invalid rule"
    }
  }

  return (
    <div className="space-y-4">
      {reminders.map((reminder) => (
        <Card key={reminder.id}>
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{reminder.notification_title_template || "Reminder"}</CardTitle>
              <Badge variant={reminder.is_active ? "default" : "secondary"}>
                {reminder.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            {reminder.notification_message_template && (
              <CardDescription className="text-sm pt-1">{reminder.notification_message_template}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
            <p>Frequency: <span className="font-medium text-foreground">{formatRRule(reminder.rrule)}</span></p>
            <p>Time: <span className="font-medium text-foreground">{reminder.time_of_day}</span></p>
            {reminder.default_value !== null && reminder.default_value !== undefined && (
              <p>
                Default value: <span className="font-medium text-foreground">
                  {reminder.default_value}{unitName ? ` ${unitName}` : ''}
                </span>
              </p>
            )}
            {/* TODO: Display next trigger time? Requires calculation/fetching */}
            {/* <p>Next: {reminder.next_trigger_at ? new Date(reminder.next_trigger_at).toLocaleString() : "N/A"}</p> */}
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 