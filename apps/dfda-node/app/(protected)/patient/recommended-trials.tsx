"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface RecommendedTrialsProps {
  trials: any[]
}

/**
 * Displays a list of recommended clinical trials in a card layout.
 *
 * Renders each trial with its name, status badge, associated condition and treatment, and a link to detailed information.
 *
 * @param trials - Array of trial objects to display
 */
export function RecommendedTrials({ trials }: RecommendedTrialsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommended Trials</CardTitle>
        <CardDescription>Trials that may be relevant to your conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trials.map((trial) => (
            <div key={trial.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{trial.name}</h3>
                  <Badge variant={getStatusVariant(trial.status)}>{formatStatus(trial.status)}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {trial.conditions.name} • {trial.treatments.name}
                </p>
              </div>
              <Link href={`/patient/trial-details/${trial.id}`}>
                <Button variant="ghost" size="sm" className="gap-1">
                  Details
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Returns the badge variant string corresponding to a clinical trial's status.
 *
 * @param status - The status of the clinical trial
 * @returns The badge variant to use for the given status
 */
function getStatusVariant(status: string) {
  switch (status) {
    case "active":
      return "default"
    case "draft":
      return "secondary"
    case "completed":
      return "success"
    case "cancelled":
      return "destructive"
    default:
      return "outline"
  }
}

/**
 * Returns the status string with the first letter capitalized.
 *
 * @param status - The status value to format
 * @returns The status string with an uppercase initial letter
 */
function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

