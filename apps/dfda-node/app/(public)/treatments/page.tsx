import { Suspense } from 'react';
import { getTreatmentsAction } from "@/lib/actions/treatments";
import type { Treatment } from "@/lib/actions/treatments";
import { Separator } from "@/components/ui/separator";
import { logger } from "@/lib/logger";
import { TreatmentsList } from "@/components/TreatmentsList";
import { TreatmentCardSkeleton } from "@/components/TreatmentCardSkeleton";

/**
 * Renders a responsive grid of skeleton cards as a placeholder while treatment data is loading.
 */
function TreatmentsSkeletonFallback() {
  // Render a few skeletons (e.g., 6)
  const skeletonCount = 6;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: skeletonCount }).map((_, index) => (
        <TreatmentCardSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Asynchronously fetches and displays a list of treatments, handling loading and error states.
 *
 * If fetching treatments fails, displays an error message instead of the list.
 *
 * @returns A React element containing either the treatments list or an error message.
 */
async function TreatmentsContent() {
  let treatments: Treatment[] = [];
  try {
    treatments = await getTreatmentsAction();
  } catch (error) {
    logger.error('Error fetching treatments for index page:', { error });
    // Handle error state appropriately, maybe return an error component
    return <p className="text-destructive">Failed to load treatments.</p>;
  }
  return <TreatmentsList treatments={treatments} />;
}

/**
 * Renders the Treatments page with a heading, separator, and a list of treatments.
 *
 * Displays a loading skeleton while treatment data is being fetched and handles asynchronous data loading using React Suspense.
 */
export default function TreatmentsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Treatments</h1>
      <Separator className="mb-6" />

      {/* Wrap the data-dependent component in Suspense */}
      <Suspense fallback={<TreatmentsSkeletonFallback />}>
        {/* This component will be rendered once its data is ready */}
        <TreatmentsContent />
      </Suspense>
    </div>
  );
}
