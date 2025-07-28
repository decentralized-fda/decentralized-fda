"use client"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, Calendar, AlertCircle, ChevronRight } from "lucide-react"

interface Trial {
  id: string
  name: string
  research_partner: string
  enrolledPatients: number
  targetPatients: number
  progress: number
  nextVisit?: string
  pendingActions: number
}

interface ActiveTrialsProps {
  trials: Trial[]
  className?: string
}

/**
 * Displays a list of active clinical trials in a card layout with enrollment progress, next visit, and pending actions.
 *
 * Renders each trial with its name, research partner, patient enrollment status, progress bar, next visit date, and pending actions. Includes navigation buttons to view trial details and find more trials.
 *
 * @param trials - Array of clinical trial objects to display
 * @param className - Optional CSS class for custom styling
 */
export function ActiveTrials({ trials, className = "" }: ActiveTrialsProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Active Trials</CardTitle>
        <CardDescription>Your current participation in clinical trials</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {trials.map((trial) => (
            <div key={trial.id} className="rounded-lg border p-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-primary" />
                    <h3 className="font-medium">{trial.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{trial.research_partner}</p>
                </div>
                <Badge variant="outline">
                  {trial.enrolledPatients}/{trial.targetPatients} Patients
                </Badge>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>Enrollment Progress</span>
                  <span>{trial.progress}%</span>
                </div>
                <Progress value={trial.progress} className="h-2" />
              </div>

              <div className="mt-4 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Next visit: {trial.nextVisit}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm">{trial.pendingActions} pending actions</span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Link href={`/provider/trials/${trial.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            <Link href="/find-trials">
              <Button variant="outline">
                Find More Trials
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
