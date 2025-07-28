import { OutcomeLabel } from "@/components/OutcomeLabel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getOutcomeLabelDataAction } from "@/lib/actions/global-variable-relationships";
import { createClient } from "@/utils/supabase/server";

/**
 * Renders the outcome label details page for a given predictor variable.
 *
 * Fetches outcome label data based on the provided `predictorVariableId` and displays it using the `OutcomeLabel` component, along with navigation back to the outcome labels list.
 */
export default async function OutcomeLabelPage({ params }: { params: { predictorVariableId: string } }) {
    const { predictorVariableId } = await params;
    
    // Call the server action to get data
    const outcomeLabelData = await getOutcomeLabelDataAction(predictorVariableId);

    return (
        <div className="py-6 md:py-10">
            <div className="container">
                <div className="mb-8 flex items-center gap-2">
                    <Link href="/outcome-labels" className="text-muted-foreground hover:text-foreground flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Outcome Labels
                    </Link>
                </div>
                <div className="flex justify-center">
                    <OutcomeLabel {...outcomeLabelData} />
                </div>
            </div>
        </div>
    );
}

/**
 * Generates dynamic page metadata based on the predictor variable's name.
 *
 * Retrieves the name of the predictor variable from the database using the provided `predictorVariableId` and sets it as the page title. If the name is not found, defaults to "Outcome Label".
 *
 * @returns An object containing the page title for metadata.
 */
export async function generateMetadata({ params }: { params: { predictorVariableId: string } }) {
    const { predictorVariableId } = await params;
    const supabase = await createClient();
    const { data: predictorData } = await supabase
        .from('global_variables')
        .select('name')
        .eq('id', predictorVariableId)
        .single<{name: string | null}>();

    return {
        title: `${predictorData?.name || 'Outcome Label'} | Decentralized FDA`,
    };
} 