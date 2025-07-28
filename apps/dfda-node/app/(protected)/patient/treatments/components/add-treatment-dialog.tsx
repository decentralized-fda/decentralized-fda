"use client"

import { useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"
import { TreatmentSearch } from "@/components/treatment-search"
import { createLogger } from "@/lib/logger"
import { addSinglePatientTreatmentAction } from "@/lib/actions/patient-treatments"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"

const logger = createLogger("add-treatment-dialog")

interface AddTreatmentDialogProps {
  userId: string;
  onSuccess?: () => void;
}

/**
 * Displays a dialog interface for adding a treatment to a patient's tracked list.
 *
 * Opens a modal dialog where users can search for and select a treatment to add. Handles asynchronous submission, displays success or error notifications, and navigates to the new treatment record upon successful addition. Optionally invokes a callback after success.
 *
 * @param userId - The unique identifier of the patient to whom the treatment will be added.
 * @param onSuccess - Optional callback invoked after a successful treatment addition.
 */
export function AddTreatmentDialog({ 
  userId, 
  onSuccess
}: AddTreatmentDialogProps) {
  const [selectedTreatment, setSelectedTreatment] = useState<{ id: string; name: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    logger.info("handleSubmit called", { 
        userId,
        selectedTreatment,
    });

    if (!selectedTreatment) {
        logger.warn("handleSubmit aborted: No treatment selected");
        toast({ title: "Missing Treatment", description: "Please select a treatment.", variant: "destructive" });
        return;
    }
    
    setIsLoading(true);

    try {
      logger.info("Calling addSinglePatientTreatmentAction...", { patientId: userId, treatmentId: selectedTreatment.id });
      
      const result = await addSinglePatientTreatmentAction({ 
         patient_id: userId,
         treatment_id: selectedTreatment.id 
      });

      if (!result.success || !result.data?.id) { 
         throw new Error(result.error || "Failed to save treatment record"); 
      }
      const newPatientTreatmentId = result.data.id; 
      logger.info("Successfully added patient treatment record via action", { newPatientTreatmentId });

      toast({ title: "Treatment Added", description: `${selectedTreatment.name} added successfully.` });

      if (onSuccess) {
          logger.info("Calling onSuccess callback provided to AddTreatmentDialog");
          onSuccess(); 
      } else {
          logger.info("No onSuccess callback provided, attempting router.refresh()");
          router.refresh()
      }
      
      setInternalOpen(false);

      router.push(`/patient/treatments/${newPatientTreatmentId}`);

    } catch (error: any) {
      logger.error("Error in handleSubmit", { 
        error: error?.message ?? String(error),
        userId,
        treatmentId: selectedTreatment?.id, 
      })
      
      toast({
        title: "Error",
        description: error?.message || "An unexpected error occurred. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    setInternalOpen(isOpen)
    if (!isOpen) {
      logger.info("Dialog closed, resetting state");
      setSelectedTreatment(null)
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={internalOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Treatment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Treatment to Track</DialogTitle>
          <DialogDescription>
            Select a treatment to add it to your tracked list. You can rate it later.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="treatment" className="text-right">
                Treatment
              </Label>
              <TreatmentSearch 
                selected={selectedTreatment}
                onSelect={setSelectedTreatment}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
            <Button 
              type="submit" 
              disabled={
                !selectedTreatment || 
                isLoading
              }
            >
              {isLoading ? "Adding..." : "Add Treatment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 