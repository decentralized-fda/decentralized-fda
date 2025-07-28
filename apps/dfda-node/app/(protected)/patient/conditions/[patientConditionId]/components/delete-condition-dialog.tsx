"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deletePatientConditionAction } from "@/lib/actions/patient-conditions"
import { useToast } from "@/components/ui/use-toast"
import { createLogger } from "@/lib/logger"

const logger = createLogger("delete-condition-dialog")

interface DeleteConditionDialogProps {
  patientConditionId: string
  conditionName?: string | null
  children: React.ReactNode
}

/**
 * Displays a confirmation dialog for deleting a patient condition and handles the deletion process.
 *
 * Renders a dialog that prompts the user to confirm permanent deletion of a specified patient condition. On confirmation, deletes the condition, shows a success or error notification, and navigates to the updated conditions list.
 *
 * @param patientConditionId - The unique identifier of the patient condition to delete.
 * @param conditionName - The name of the condition to display in the dialog (optional).
 * @param children - The element(s) that trigger the dialog when interacted with.
 */
export function DeleteConditionDialog({ patientConditionId, conditionName, children }: DeleteConditionDialogProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deletePatientConditionAction(patientConditionId)
        toast({ title: "Success", description: `Condition '${conditionName || 'selected'}' deleted.` })
        setOpen(false)
        // Redirect user after successful deletion
        router.push("/patient/conditions") // Redirect to the conditions list page
        router.refresh() // Force refresh to update list
      } catch (error) {
        logger.error("Failed to delete condition", { error, patientConditionId });
        toast({ title: "Error", description: "Failed to delete condition. Please try again.", variant: "destructive" })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently delete the condition{' '}
            <span className="font-semibold">{conditionName || 'selected'}</span>.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete Condition"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 