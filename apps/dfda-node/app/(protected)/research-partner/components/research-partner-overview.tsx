import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ResearchPartnerOverviewProps {
  name: string
  totalTrials: number
  totalEnrollment: number
}

/**
 * Displays an overview card for a research partner, showing their name, total active trials, and total enrolled participants.
 *
 * @param name - The name of the research partner
 * @param totalTrials - The number of active trials associated with the partner
 * @param totalEnrollment - The total number of participants enrolled in the partner's trials
 */
export function ResearchPartnerOverview({ name, totalTrials, totalEnrollment }: ResearchPartnerOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>Research Partner Dashboard Overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-2xl font-bold">{totalTrials}</p>
            <p className="text-sm text-muted-foreground">Total Active Trials</p>
          </div>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{totalEnrollment}</p>
            <p className="text-sm text-muted-foreground">Total Enrolled Participants</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 