import { FindTrialsForm } from "./components/find-trials-form"
import type { Metadata } from 'next';
import { getMetadataFromNavKey } from '@/lib/metadata';

/**
 * Generates and returns metadata for the "Find Clinical Trials" page.
 *
 * @returns A promise that resolves to the page metadata.
 */
export async function generateMetadata(): Promise<Metadata> {
  return getMetadataFromNavKey('find_trials');
}

/**
 * Renders the "Find Clinical Trials" page with a heading, description, and a form for searching clinical trials by medical condition.
 */
export default async function FindTrialsPage() {
  return (
    <div className="container max-w-2xl py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Clinical Trials</h1>
        <p className="text-muted-foreground">
          Search for clinical trials by medical condition
        </p>
      </div>
      <FindTrialsForm />
    </div>
  )
} 