import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CreateFormWizard } from "./components/create-form-wizard"

/**
 * Renders the form management creation page for providers, including navigation, a heading, and the form creation wizard.
 *
 * Displays a full-page layout with a back link to the provider dashboard, a "Form Management" heading, and the `CreateFormWizard` component for creating new forms.
 */
export default function CreateFormPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 md:py-10">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 flex items-center gap-2">
              <Link href="/provider/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to dashboard</span>
              </Link>
              <h1 className="text-2xl font-bold">Form Management</h1>
            </div>
            <CreateFormWizard />
          </div>
        </div>
      </main>
    </div>
  )
}


