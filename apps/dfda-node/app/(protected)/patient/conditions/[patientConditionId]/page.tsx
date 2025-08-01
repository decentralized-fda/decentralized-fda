import { getServerUser } from "@/lib/server-auth"
import { redirect } from "next/navigation"
import { getPatientConditionByIdAction } from "@/lib/actions/patient-conditions" // Action to get specific PC
import { getRatingsForPatientConditionAction } from "@/lib/actions/treatment-ratings" // Action to get ratings
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link" // Import Link
import { notFound } from 'next/navigation'
import { Suspense } from "react"
import { createLogger } from "@/lib/logger"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Star, MoreVertical } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
// Import Breadcrumb components
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbPage, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"

// Import Dialog Components
import { EditConditionDialog } from "./components/edit-condition-dialog"
import { DeleteConditionDialog } from "./components/delete-condition-dialog"
import { RateTreatmentDialog } from "./components/rate-treatment-dialog"
import { EditNotesDialog } from "./components/edit-notes-dialog"

// Import List Components
import { RatingsList } from "./components/ratings-list"

const logger = createLogger("patient-condition-detail-page")

// Helper for severity emojis (can be moved to a constants file later)
const severityEmojis: Record<string, string> = {
  mild: "😊",
  moderate: "😐",
  severe: "😟",
  // Add "unknown" or default case if needed
};

// Destructure params directly in the signature
export default async function PatientConditionDetailPage({ params }: { params: Promise<{ patientConditionId: string }> }) {
  // Await params before accessing its properties
  const { patientConditionId } = await params;
  
  const user = await getServerUser()
  if (!user) {
    redirect("/login")
  }

  // Use the awaited patientConditionId
  logger.info("Loading patient condition detail page", { userId: user.id, patientConditionId });

  // Fetch the specific patient condition record using the awaited ID
  const condition = await getPatientConditionByIdAction(patientConditionId);

  // If condition not found or doesn't belong to user (assuming RLS handles user check), show 404
  if (!condition || condition.patient_id !== user.id) {
     logger.warn("Patient condition not found or access denied", { userId: user.id, patientConditionId });
     notFound();
  }

  // Fetch associated ratings for this patient condition
  const conditionRatings = await getRatingsForPatientConditionAction(patientConditionId);


  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/patient/conditions">Conditions</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{condition.condition_name || "Condition Details"}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

       {/* Back Button - Moved inside the main container's flow */}
       {/* Removed outer div - Let flex handle alignment if needed later */}
       {/* 
       <div className="lg:col-span-2"> 
          <Link href="/patient/conditions">
             <Button variant="outline" size="sm">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back to Conditions
             </Button>
          </Link>
       </div>
       */}

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Header Card - Spans both columns on large screens */}
        <Card className="lg:col-span-2">
           <CardHeader>
              <div className="flex justify-between items-start gap-4">
                 <div className="flex-1">
                    <CardTitle className="text-2xl">{condition.condition_name || "Condition Details"}</CardTitle>
                    {condition.description && (
                      <CardDescription>{condition.description}</CardDescription>
                    )}
                 </div>
                 <div className="flex-shrink-0">
                    <DropdownMenu>
                       <DropdownMenuTrigger asChild>
                         <Button variant="ghost" size="icon" className="w-8 h-8">
                           <MoreVertical className="h-4 w-4" />
                         </Button>
                       </DropdownMenuTrigger>
                       <DropdownMenuContent align="end">
                         <EditConditionDialog patientCondition={condition}>
                            <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left">
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit Details</span>
                            </button>
                         </EditConditionDialog>
                         <DeleteConditionDialog 
                            patientConditionId={condition.id!} 
                            conditionName={condition.condition_name} 
                         >
                           <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete Condition</span>
                            </button>
                         </DeleteConditionDialog>
                       </DropdownMenuContent>
                     </DropdownMenu>
                 </div>
              </div>
           </CardHeader>
           <CardContent className="grid gap-4 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div><Badge variant={condition.status === 'active' ? 'default' : 'secondary'} className="capitalize">{condition.status || "N/A"}</Badge></div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Severity</p>
                <p className="capitalize">
                   {condition.severity && severityEmojis[condition.severity.toLowerCase()] ? 
                     `${severityEmojis[condition.severity.toLowerCase()]} ` : ''}
                   {condition.severity || "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Diagnosed Date</p>
                <p>{condition.diagnosed_at ? new Date(condition.diagnosed_at).toLocaleDateString() : "N/A"}</p>
              </div>
           </CardContent>
         </Card>

        {/* Condition Ratings Card */}
        <Card>
           <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Treatment Ratings</CardTitle>
                <CardDescription>How effective have treatments been specifically for {condition.condition_name || "this condition"}?</CardDescription>
              </div>
               <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
               <RateTreatmentDialog patientCondition={condition}>
                   <Button variant="outline" size="sm">
                   <Star className="mr-2 h-4 w-4"/> Rate Treatment
                 </Button>
               </RateTreatmentDialog>
                 <Link href="/patient/reminders" passHref>
                    <Button variant="secondary" size="sm">
                      Manage Reminders
                    </Button>
                  </Link>
                </div>
            </CardHeader>
            <CardContent>
                <Suspense fallback={<p className="text-muted-foreground">Loading ratings...</p>}> 
                   <RatingsList ratings={conditionRatings} patientCondition={condition} /> 
                </Suspense>
            </CardContent>
        </Card>


        {/* Notes Card - Only shown if notes exist */}
        {condition.notes && (
          <Card>
             <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Notes</CardTitle>
                 <EditNotesDialog patientCondition={condition}>
                   <Button variant="ghost" size="icon">
                     <Edit className="h-4 w-4" />
                   </Button>
                 </EditNotesDialog>
              </CardHeader>
              <CardContent>
                 <p className="text-sm whitespace-pre-wrap">{condition.notes}</p>
              </CardContent>
           </Card>
         )}
      </div>
    </div>
  )
}

// Force dynamic rendering for this page as it depends on params
export const dynamic = 'force-dynamic' 