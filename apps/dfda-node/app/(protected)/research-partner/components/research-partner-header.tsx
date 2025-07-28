import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

interface ResearchPartnerHeaderProps {
  name: string
}

/**
 * Displays a header for research partners with a personalized greeting and a button to create a new trial.
 *
 * If no name is provided, the greeting defaults to "Research Partner".
 *
 * @param name - The name to display in the greeting, or a fallback if not provided.
 */
export function ResearchPartnerHeader({ name }: ResearchPartnerHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Welcome, {name || "Research Partner"}</h1>
      <div className="flex items-center gap-2">
        <Link href="/research-partner/create-trial">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Trial
          </Button>
        </Link>
      </div>
    </div>
  )
} 