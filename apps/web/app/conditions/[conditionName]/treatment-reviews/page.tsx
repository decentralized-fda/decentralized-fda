import {getConditionByNameWithTreatmentRatings} from "@/app/dfdaActions";
import TreatmentRatingsList from "@/app/components/TreatmentRatingsList";
import { DFDABreadcrumbs } from "@/components/Breadcrumbs/DFDABreadcrumbs";


export default async function ConditionTreatmentRatingsPage({ params }: { params: { conditionName: string } }) {
    // Decode the conditionName from the URL
    const decodedConditionName = decodeURIComponent(params.conditionName);

    const condition = await getConditionByNameWithTreatmentRatings(decodedConditionName)

    if (!condition) {
        return <div>Condition not found</div>
    }

    return (
        <div className="container mx-auto p-4">
        <DFDABreadcrumbs dynamicValues={{ 
            conditionName: condition.name,
        }} />
            <h1 className="text-2xl font-bold mb-4">{condition.name} Treatment Ratings</h1>
            <TreatmentRatingsList condition={condition} />
        </div>
    )
}