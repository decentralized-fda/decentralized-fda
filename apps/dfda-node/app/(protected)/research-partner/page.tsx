import type { Metadata } from "next"
import { getServerUser } from "@/lib/server-auth"
import { redirect } from "next/navigation"
import { ResearchPartnerOverview } from "./components/research-partner-overview"
import { TrialEnrollment } from "./components/trial-enrollment"
import { TrialManagement } from "./components/trial-management"
import { RecentActivity } from "./components/recent-activity"
import { getUserProfile } from "@/lib/profile"
import { logger } from "@/lib/logger"
import { getResearchPartnerTrialsAction } from "@/lib/actions/trials"

export const metadata: Metadata = {
  title: "Research Partner Dashboard | FDA v2",
  description: "Manage your clinical trials and view enrollment statistics.",
}

/**
 * Renders the Research Partner Dashboard page for authenticated users with the "research-partner" role.
 *
 * Enforces authentication and role-based access, retrieves the research partner's profile and associated clinical trials, computes summary statistics, and displays dashboard sections for overview, trial enrollment, management, and recent activity.
 *
 * Redirects to the login page if unauthenticated, or to the role selection page with an error if the user lacks the required role.
 */
export default async function ResearchPartnerDashboard() {
  const user = await getServerUser()

  if (!user) {
    redirect("/login?callbackUrl=/research-partner/")
  }

  const researchPartnerProfile = await getUserProfile(user)

  if (!researchPartnerProfile || researchPartnerProfile.user_type !== 'research-partner') {
    logger.warn("User accessed research partner dashboard with invalid/missing profile or wrong user_type.", { userId: user.id, userType: researchPartnerProfile?.user_type })
    redirect("/select-role?error=access_denied")
  }

  const { activeTrials, completedTrials, pendingTrials } = await getResearchPartnerTrialsAction(user.id)

  const researchPartnerName = researchPartnerProfile?.first_name && researchPartnerProfile?.last_name
    ? `${researchPartnerProfile.first_name} ${researchPartnerProfile.last_name}`
    : "Research Partner"

  const researchPartnerData = {
    name: researchPartnerName,
    activeTrials: activeTrials || [],
    completedTrials: completedTrials || [],
    pendingTrials: pendingTrials || [],
    totalEnrollment: (activeTrials || []).reduce((sum, trial) => sum + (trial.current_enrollment || 0), 0),
    totalTrials: (activeTrials || []).length + (completedTrials || []).length,
  }

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 md:py-10">
        <div className="container">
          <div className="mx-auto max-w-5xl space-y-8">
            <ResearchPartnerOverview
              name={researchPartnerData.name}
              totalTrials={researchPartnerData.totalTrials}
              totalEnrollment={researchPartnerData.totalEnrollment}
            />

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Trial Enrollment</h2>
              <TrialEnrollment trials={researchPartnerData.activeTrials} />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Trial Management</h2>
              <TrialManagement
                activeTrials={researchPartnerData.activeTrials}
                completedTrials={researchPartnerData.completedTrials}
                pendingApproval={researchPartnerData.pendingTrials}
              />
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Recent Activity</h2>
              <RecentActivity activities={researchPartnerData.activeTrials} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}


