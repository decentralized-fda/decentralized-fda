import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Microscope, FileText } from "lucide-react"

interface DashboardHeaderProps {
  title: string
  description: string
}

/**
 * Displays a dashboard header with a title, description, and navigation buttons.
 *
 * Renders the provided title and description alongside buttons for navigating to the "Find Trials" and "Create Form" pages.
 *
 * @param title - The main heading text to display
 * @param description - The descriptive text shown below the title
 */
export function DashboardHeader({ title, description }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="flex gap-2">
        <Link href="/find-trials">
          <Button>
            <Microscope className="mr-2 h-4 w-4" />
            Find Trials
          </Button>
        </Link>
        <Link href="/provider/form-management/create">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Create Form
          </Button>
        </Link>
      </div>
    </div>
  )
}

