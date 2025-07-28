import { getFeaturedTrialsAction, getStatisticsAction } from "@/lib/actions/homepage";
import { HeroSection } from "@/components/HeroSection";
import { ComparativeEffectivenessSection } from "@/components/ComparativeEffectivenessSection";
import { HowItWorksSection } from "@/components/HowItWorksSection";
import { KeyBenefitsSection } from "@/components/KeyBenefitsSection";
import { RevolutionizingMedicalProgressSection } from "@/components/RevolutionizingMedicalProgressSection";
import { OutcomeLabelsSection } from "@/components/OutcomeLabelsSection";
import { FeaturedTrialsSection } from "@/components/FeaturedTrialsSection";
import { ReferendumSection } from "@/components/ReferendumSection";

/**
 * Asynchronously renders the homepage by fetching required data and composing multiple UI sections.
 *
 * Fetches featured trials and statistics data on the server, then renders a sequence of homepage sections, passing the statistics to the relevant component.
 */
export default async function Home() {
  // Fetch data on the server
  const featuredTrials = await getFeaturedTrialsAction();
  const statistics = await getStatisticsAction();

  return (
    <>
      <HeroSection />
      <ComparativeEffectivenessSection />
      <OutcomeLabelsSection />
      <HowItWorksSection />
      <KeyBenefitsSection />
      <RevolutionizingMedicalProgressSection stats={statistics} />
      <ReferendumSection />
      {/* <FeaturedTrialsSection trials={featuredTrials as any} /> */}
    </>
  );
}
