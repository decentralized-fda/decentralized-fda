"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, User, Activity, Microscope, FileText, Pill, ChevronRight } from "lucide-react"
import type { Database } from "@/lib/database.types"

// Use the auto-generated database types
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"]
type PatientRow = Database["public"]["Tables"]["patients"]["Row"]

/**
 * Calculates the age in years based on a given date of birth string.
 *
 * Returns 0 if the input is null, undefined, or not a valid date.
 *
 * @param dateOfBirth - The date of birth as a string, or null/undefined
 * @returns The calculated age in years, or 0 if the input is invalid
 */
function calculateAge(dateOfBirth: string | null | undefined): number {
  if (!dateOfBirth) return 0
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDifference = today.getMonth() - dob.getMonth()
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

// Extend with UI-specific properties
type EligiblePatient = ProfileRow & PatientRow & {
  eligibleTrials: { id: string; name: string }[]
  lastVisit: string
  status: string
  condition: string
}

type EnrolledPatient = ProfileRow & PatientRow & {
  trial: string
  enrollmentDate: string
  nextVisit: string
  condition: string
  pendingActions: { type: string; name: string; due: string }[]
}

interface PatientManagementProps {
  eligiblePatients: EligiblePatient[]
  enrolledPatients: EnrolledPatient[]
}

/**
 * Displays and manages lists of patients eligible for or enrolled in clinical trials, with search and filtering capabilities.
 *
 * Provides a tabbed interface to view, filter, and interact with eligible and enrolled patients, including actions such as enrolling in trials, viewing patient details, and managing pending actions.
 *
 * @param eligiblePatients - Array of patients eligible for clinical trials, including eligibility and visit details.
 * @param enrolledPatients - Array of patients enrolled in clinical trials, including enrollment, trial, and pending action details.
 */
export function PatientManagement({ eligiblePatients, enrolledPatients }: PatientManagementProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter patients based on search query
  const filteredEligiblePatients = eligiblePatients.filter(
    (patient) =>
      patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredEnrolledPatients = enrolledPatients.filter(
    (patient) =>
      patient.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.condition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.trial.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Management</CardTitle>
        <CardDescription>Manage patients eligible for or enrolled in clinical trials</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search patients by name, condition, or trial..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="eligible">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="eligible">Eligible Patients</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled Patients</TabsTrigger>
          </TabsList>

          <TabsContent value="eligible" className="space-y-4 pt-4">
            {filteredEligiblePatients.length > 0 ? (
              filteredEligiblePatients.map((patient) => (
                <div key={patient.id} className="rounded-lg border p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {`${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{`${patient.first_name || ''} ${patient.last_name || ''}`}</h3>
                        <p className="text-sm text-muted-foreground">
                          {calculateAge(patient.date_of_birth)} years • {patient.condition}
                        </p>
                      </div>
                    </div>
                    <Badge variant={patient.status === "Pending consent" ? "outline" : "secondary"}>
                      {patient.status}
                    </Badge>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Eligible for trials:</h4>
                    <div className="space-y-2">
                      {patient.eligibleTrials.map((trial) => (
                        <div key={trial.id} className="flex items-center justify-between rounded-lg bg-muted p-2">
                          <span className="text-sm">{trial.name}</span>
                          <Link href={`/provider/patients/${patient.id}/enroll?trial=${trial.id}`}>
                            <Button size="sm">Enroll</Button>
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">Last visit: {patient.lastVisit}</div>
                    <Link href={`/provider/patients/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        View Patient
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No eligible patients found matching your search.
              </div>
            )}
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4 pt-4">
            {filteredEnrolledPatients.length > 0 ? (
              filteredEnrolledPatients.map((patient) => (
                <div key={patient.id} className="rounded-lg border p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {`${patient.first_name?.[0] || ''}${patient.last_name?.[0] || ''}`}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{`${patient.first_name || ''} ${patient.last_name || ''}`}</h3>
                        <p className="text-sm text-muted-foreground">
                          {calculateAge(patient.date_of_birth)} years • {patient.condition}
                        </p>
                      </div>
                    </div>
                    <Badge>Enrolled</Badge>
                  </div>

                  <div className="mt-4">
                    <div className="rounded-lg bg-muted p-3">
                      <div className="flex items-center gap-2">
                        <Microscope className="h-4 w-4 text-primary" />
                        <span className="font-medium">{patient.trial}</span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        Enrolled on {patient.enrollmentDate} • Next visit: {patient.nextVisit}
                      </div>
                    </div>
                  </div>

                  {patient.pendingActions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Pending actions:</h4>
                      <div className="space-y-2">
                        {patient.pendingActions.map((action, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg bg-muted/50 p-2 border border-muted"
                          >
                            <div className="flex items-center gap-2">
                              {action.type === "form" ? (
                                <FileText className="h-4 w-4 text-blue-600" />
                              ) : (
                                <Pill className="h-4 w-4 text-green-600" />
                              )}
                              <span className="text-sm">{action.name}</span>
                            </div>
                            <div className="text-sm text-muted-foreground">Due: {action.due}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end gap-2">
                    <Link href={`/provider/ehr-authorization/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        EHR Data
                      </Button>
                    </Link>
                    <Link href={`/provider/intervention-assignment/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        Assign Intervention
                      </Button>
                    </Link>
                    <Link href={`/provider/patients/${patient.id}`}>
                      <Button size="sm">View Patient</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No enrolled patients found matching your search.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">
          <User className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
        <Button variant="outline">
          <Activity className="mr-2 h-4 w-4" />
          View All Patients
        </Button>
      </CardFooter>
    </Card>
  )
}
