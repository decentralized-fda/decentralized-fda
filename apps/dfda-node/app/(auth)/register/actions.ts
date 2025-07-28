'use server'

import { createClient } from '@/utils/supabase/server'
import { getCallbackUrl } from '@/lib/url'
import { logger } from '@/lib/logger'
import { redirect } from 'next/navigation'

/**
 * Handles user registration using an email one-time password (OTP) via Supabase.
 *
 * Extracts the email from the provided form data, initiates the OTP sign-in or sign-up process, and redirects the user based on the outcome. If the email is missing or an error occurs, redirects with an appropriate error message; otherwise, instructs the user to check their email to continue registration.
 *
 * @param formData - The form data containing the user's email address
 */
export async function registerWithOtp(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient()

  if (!email) {
    logger.warn('[Action - registerWithOtp] Email is missing');
    return redirect('/register?error=Email is required');
  }

  const emailRedirectTo = getCallbackUrl() // getCallbackUrl now provides the full, correct URL

  logger.info('[Action - registerWithOtp] Attempting OTP sign up/in', { email, emailRedirectTo });

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true, // Explicitly allow user creation
      emailRedirectTo,
    },
  })

  if (error) {
    logger.error('[Action - registerWithOtp] OTP Sign up/in failed', { error: error.message });
    return redirect('/register?error=Could not register user. Please try again.');
  }

  // Redirect to a page indicating that the email has been sent
  return redirect('/register?message=Check email to continue sign up process');
}

/**
 * Initiates user registration via Google OAuth and redirects the user to the appropriate authentication or error page.
 */
export async function registerWithGoogle() {
  const supabase = await createClient()
  const redirectTo = getCallbackUrl() // Use the function directly

  logger.info('[Action - registerWithGoogle] Attempting Google OAuth', { redirectTo });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo, // Pass the correctly formed URL
    },
  });

  if (error) {
    logger.error('[Action - registerWithGoogle] Google OAuth initiation failed', { error: error.message });
    return redirect('/register?error=Could not authenticate with Google. Please try again.');
  }

  if (data.url) {
    logger.info('[Action - registerWithGoogle] Redirecting to Google URL');
    return redirect(data.url);
  }

  // Fallback case
  logger.error('[Action - registerWithGoogle] No URL returned from signInWithOAuth without error');
  return redirect('/register?error=An unexpected error occurred during Google sign in.');
} 