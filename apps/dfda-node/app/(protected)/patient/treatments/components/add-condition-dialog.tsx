"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"
import { ConditionSearchInput } from "@/components/ConditionSearchInput"
import { logger } from "@/lib/logger"
import { addPatientConditionAction } from "@/lib/actions/patient-conditions"

interface AddConditionDialogProps {
  userId: string
}

/**
 * Displays a dialog interface for adding a medical condition to a user's profile.
 *
 * Renders a button that opens a modal dialog containing a searchable input for selecting a condition. Upon selection, the condition is added to the specified user's profile, with success and error feedback provided via toast notifications.
 *
 * @param userId - The unique identifier of the user to whom the condition will be added.
 */
export function AddConditionDialog({ userId }: AddConditionDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSelectCondition = async (condition: { id: string; name: string }) => {
    try {
      logger.info("Submitting new condition", { userId, conditionId: condition.id })
      const result = await addPatientConditionAction(userId, condition.id)

      if (result.success) {
        toast({
          title: "Condition added",
          description: `${condition.name} has been added to your conditions.`
        })

        setOpen(false)
      } else {
        logger.error("Failed to add condition", { error: result.error, conditionId: condition.id, userId })
        toast({
          title: "Error",
          description: "Failed to add condition. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error) {
      logger.error("Failed to add condition", { error, conditionId: condition.id, userId })
      toast({
        title: "Error",
        description: "Failed to add condition. Please try again.",
        variant: "destructive"
      })
    } finally {
      logger.info("AddConditionDialog completed", { userId })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Condition
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Condition</DialogTitle>
          <DialogDescription>
            Add a condition to track its treatments and progress.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ConditionSearchInput
            onSelect={handleSelectCondition}
            selected={null}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
} 