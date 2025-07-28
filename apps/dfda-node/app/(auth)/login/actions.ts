'use server'

import { createClient } from '@/utils/supabase/server'
import { getCallbackUrl } from '@/lib/url'
import { logger } from '@/lib/logger'
import { redirect } from 'next/navigation'

/**
 * Initiates user authentication via a one-time password (OTP) sent to the provided email address.
 *
 * Extracts the email from the submitted form data, validates its presence, and requests Supabase to send an OTP sign-in link. Redirects the user based on the outcome, displaying appropriate messages for missing email, authentication errors, or successful OTP dispatch.
 */
export async function loginWithOtp(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient()

  if (!email) {
    logger.warn('[Action - loginWithOtp] Email is missing');
    return redirect('/login?error=Email is required');
  }

  const emailRedirectTo = getCallbackUrl()
  logger.debug('[Action - loginWithOtp] emailRedirectTo', { emailRedirectTo });

  logger.info('[Action - loginWithOtp] Attempting OTP sign in', { email, emailRedirectTo });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // shouldCreateUser: false, // Keep default (true) to allow sign-in or sign-up
      emailRedirectTo,
    },
  })

  if (error) {
    logger.error('[Action - loginWithOtp] OTP Sign in failed', { error: error.message });
    // Redirect back to login page with a generic error message
    return redirect('/login?error=Could not authenticate user. Please try again.');
  }

  // Redirect to a page indicating that the email has been sent
  return redirect('/login?message=Check email to continue sign in process');
}

/**
 * Initiates Google OAuth authentication using Supabase and redirects the user based on the authentication outcome.
 *
 * Redirects to the Google OAuth consent screen or back to the login page with an error message if authentication cannot be initiated.
 */
export async function loginWithGoogle() {
  const supabase = await createClient()
  const redirectTo = getCallbackUrl() // Use the function directly

  logger.info('[Action - loginWithGoogle] Attempting Google OAuth', { redirectTo });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo, // Pass the correctly formed URL
    },
  });

  if (error) {
    logger.error('[Action - loginWithGoogle] Google OAuth initiation failed', { error: error.message });
    return redirect('/login?error=Could not authenticate with Google. Please try again.');
  }

  if (data.url) {
    logger.info('[Action - loginWithGoogle] Redirecting to Google URL');
    return redirect(data.url);
  }

  // Fallback case
  logger.error('[Action - loginWithGoogle] No URL returned from signInWithOAuth without error');
  return redirect('/login?error=An unexpected error occurred during Google sign in.');
} 