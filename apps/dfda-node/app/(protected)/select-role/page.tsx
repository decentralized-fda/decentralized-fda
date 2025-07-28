import { redirect } from 'next/navigation'
import { getServerUser } from "@/lib/server-auth"
import { createClient } from "@/utils/supabase/server"
import { logger } from "@/lib/logger"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Briefcase, Code, HelpCircle, Stethoscope } from 'lucide-react'
import type { Database } from "@/lib/database.types"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Separator } from "@/components/ui/separator"
import { getUserProfile } from "@/lib/profile"

type UserTypeEnum = Database["public"]["Enums"]["user_type_enum"]

/**
 * Updates the authenticated user's role in their profile based on form submission.
 *
 * If no role is selected, the function returns without making changes. If the user is not authenticated, redirects to the login page. On successful update, redirects the user to the route corresponding to their selected role. Logs errors and returns early if the update fails.
 */
async function setUserType(formData: FormData) {
  'use server'

  const role = formData.get('user_type') as UserTypeEnum
  if (!role) {
    // Handle missing role error
    return; // Just return without redirecting if no role selected
  }

  const supabase = await createClient()
  const user = await getServerUser()

  if (!user) {
    return redirect('/login')
  }

  logger.info('Setting user role in profile', { userId: user.id, role });

  let profileUpdateError: any = null; // Define error variable outside try

  try {
    // 1. Update the profiles table
    ({ error: profileUpdateError } = await supabase // Assign to the outer variable
      .from('profiles')
      .update({ user_type: role })
      .eq('id', user.id)
      .select('user_type')
      .single());

    // No redirect inside the try block anymore

  } catch (err) {
    // Catch actual unexpected errors during the database operation
    logger.error('Unexpected error during profile update:', err);
    // Set the error variable or handle differently if needed
    profileUpdateError = err;
  }

  // Check for profile update error *after* the try...catch block
  if (profileUpdateError) {
    logger.error('Error setting user_type in profiles table:', profileUpdateError);
    // Potentially show an error message to the user instead of just returning
    return; // Return on error
  }

  // Redirect only if the update was successful (no error)
  logger.info('User profile role set, redirecting', { userId: user.id, role });
  redirect(`/${role}`); // Redirect is now outside the try...catch
}

/**
 * Renders a page for authenticated users to select their role on the platform or redirects them if a role is already assigned.
 *
 * If the user is not authenticated, redirects to the login page. If the user already has a role, redirects to the corresponding role-specific route. Otherwise, displays a form allowing the user to choose from Patient, Provider, Research Partner/Sponsor, or Developer roles.
 */
export default async function SelectRolePage() {
  const user = await getServerUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile(user)

  if (profile?.user_type) {
    logger.info('User already has role from profile, redirecting', { userId: user.id, role: profile.user_type });
    redirect(`/${profile.user_type}`)
  } else {
    if (profile) {
        logger.info('User profile exists but has no role, showing selection page', { userId: user.id });
    }

    logger.info('Showing role selection page', { userId: user.id });
  }

  return (
    <main className="flex items-center justify-center bg-muted/40 p-4 md:p-8">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-2xl">Select Your Role</CardTitle>
          <CardDescription className="text-center">Choose how you will use the platform.</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <form action={setUserType}>
            <RadioGroup defaultValue="" name="user_type" className="space-y-3">
              {/* Patient Role */}
              <div className="flex items-start space-x-2 rounded-md border p-4 shadow-sm transition-all hover:bg-accent/30">
                <RadioGroupItem value="patient" id="patient" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="patient" className="font-medium flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Patient
                    </Label>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72">
                        <p className="text-sm">
                          Select this if you are seeking treatment, managing your health information, or looking for clinical trials.
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
              </div>
              
              {/* Provider Role */}
              <div className="flex items-start space-x-2 rounded-md border p-4 shadow-sm transition-all hover:bg-accent/30">
                <RadioGroupItem value="provider" id="provider" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="provider" className="font-medium flex items-center cursor-pointer">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Provider
                    </Label>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72">
                        <p className="text-sm">
                          Select this if you are a healthcare provider, physician, or clinician caring for patients.
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
              </div>

              {/* Research Partner Role */}
              <div className="flex items-start space-x-2 rounded-md border p-4 shadow-sm transition-all hover:bg-accent/30">
                <RadioGroupItem value="research-partner" id="research-partner" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="research-partner" className="font-medium flex items-center cursor-pointer">
                      <Briefcase className="mr-2 h-4 w-4" />
                      Research Partner / Sponsor
                    </Label>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72">
                        <p className="text-sm">
                          Select this if you represent an organization conducting research, clinical trials, or analyzing health data.
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
              </div>

              {/* Developer Role */}
              <div className="flex items-start space-x-2 rounded-md border p-4 shadow-sm transition-all hover:bg-accent/30">
                <RadioGroupItem value="developer" id="developer" className="mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="developer" className="font-medium flex items-center cursor-pointer">
                      <Code className="mr-2 h-4 w-4" />
                      Developer
                    </Label>
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-72">
                        <p className="text-sm">
                          Select this if you want to build applications or integrations using the platform's APIs and tools.
                        </p>
                      </HoverCardContent>
                    </HoverCard>
                  </div>
                </div>
              </div>
            </RadioGroup>
            
            <Separator className="my-6" />
            
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  )
} 