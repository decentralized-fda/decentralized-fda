import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EhrAuthorizationForm } from "./components/ehr-authorization-form"

/**
 * Renders the EHR Data Authorization page for a specific patient.
 *
 * Displays a back navigation link, a page heading, and the EHR authorization form for the patient identified by the provided `patientId`.
 *
 * @param params - Route parameters containing the `patientId` of the patient whose EHR authorization is being managed.
 */
export default function EhrAuthorizationPage({ params }: { params: { patientId: string } }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 md:py-10">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 flex items-center gap-2">
              <Link href="/provider/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold">EHR Data Authorization</h1>
            </div>
            <EhrAuthorizationForm patientId={params.patientId} />
          </div>
        </div>
      </main>
    </div>
  )
}

