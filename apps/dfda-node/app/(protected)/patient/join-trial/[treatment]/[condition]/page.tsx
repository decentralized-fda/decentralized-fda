import JoinTrialWizard from "./components/join-trial-wizard";

interface PageProps {
  params: {
    treatment: string;
    condition: string;
  };
}

/**
 * Renders the trial joining page, validating and decoding treatment and condition parameters before displaying the trial wizard or an error message.
 *
 * Displays an error if either the treatment or condition parameter is missing.
 */
export default function JoinTrialPage({ params }: PageProps) {
  const treatment = decodeURIComponent(params.treatment);
  const condition = decodeURIComponent(params.condition);

  // Basic check if parameters exist, could add more robust handling
  if (!treatment || !condition) {
    // Handle cases where params might be missing, e.g., return a 404 or error message
    return <div>Error: Missing trial information.</div>;
  }

  return (
    <div className="container py-6 md:py-10">
      {/* Render the client component wizard */}
      <JoinTrialWizard treatment={treatment} condition={condition} />
    </div>
  );
}

