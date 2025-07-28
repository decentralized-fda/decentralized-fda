import { FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

/**
 * Displays a card with personalized health insights and interactive health factors, each with a tooltip explaining how treatments may affect them.
 *
 * Renders a UI card featuring a title, descriptive text, and a list of health factors ("Sleep Quality," "Pain Levels," "Energy," "Mood") as pill-shaped elements. Hovering or focusing on each factor reveals a tooltip with additional information.
 */
export function HealthJourney() {
  const healthFactors = ["Sleep Quality", "Pain Levels", "Energy", "Mood"]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Your Health Journey
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border p-4 bg-primary/5">
          <div>
            <h4 className="font-medium">Personalized Health Insights</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              Joining a trial gives you detailed insights about your health. Track your progress and see how treatments
              affect your specific symptoms and quality of life.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {healthFactors.map((factor, index) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {factor}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>See how treatments affect your {factor.toLowerCase()}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

