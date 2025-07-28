import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ResearchPartnerStatsProps {
  activeTrials: number
  totalParticipants: number
  pendingApproval: number
}

/**
 * Displays summary statistics for a research partner, including active trials, total participants, and trials pending approval.
 *
 * Renders three cards showing the number of active trials, the total number of participants across those trials, and the number of trials awaiting approval. Each card includes a title, a prominently displayed statistic, and a descriptive subtitle.
 *
 * @param activeTrials - The number of currently active trials
 * @param totalParticipants - The total number of participants across all active trials
 * @param pendingApproval - The number of trials pending approval
 */
export function ResearchPartnerStats({ activeTrials, totalParticipants, pendingApproval }: ResearchPartnerStatsProps) {
  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Active Trials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{activeTrials}</div>
          <p className="text-xs text-muted-foreground">{activeTrials === 1 ? "Trial" : "Trials"} in progress</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Total Participants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{totalParticipants}</div>
          <p className="text-xs text-muted-foreground">Across {activeTrials} active trials</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Pending Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{pendingApproval}</div>
          <p className="text-xs text-muted-foreground">
            {pendingApproval === 1 ? "Trial" : "Trials"} awaiting approval
          </p>
        </CardContent>
      </Card>
    </>
  )
} 