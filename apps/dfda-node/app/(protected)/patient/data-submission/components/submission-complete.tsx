"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrialSubmissionData } from "./data-submission-form"

interface SubmissionCompleteProps {
  trialData: TrialSubmissionData
}

/**
 * Displays a confirmation card indicating successful data submission for a specific trial.
 *
 * Shows the trial title and provides a button to return to the patient dashboard.
 *
 * @param trialData - Contains information about the submitted trial, including its title.
 */
export function SubmissionComplete({ trialData }: SubmissionCompleteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Complete</CardTitle>
        <CardDescription>Thank you for submitting your data for {trialData.trial.title}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <a href="/patient/">Return to Dashboard</a>
        </Button>
      </CardContent>
    </Card>
  )
}
