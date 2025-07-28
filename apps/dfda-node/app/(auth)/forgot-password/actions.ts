'use server'

import { createClient } from '@/utils/supabase/server'
import { getCallbackUrl } from '@/lib/url'
import { logger } from '@/lib/logger'
import { redirect } from 'next/navigation'

/**
 * Handles a password reset request by extracting the email from form data, initiating a password reset via Supabase, and redirecting the user based on the outcome.
 *
 * If the email is missing or an error occurs during the reset request, the user is redirected to the forgot password page with an appropriate error message. On success, the user is redirected with instructions to check their email.
 *
 * @param formData - The submitted form data containing the user's email address
 */
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  const supabase = await createClient()

  if (!email) {
    logger.warn('[Action - requestPasswordReset] Email is missing');
    // No need for return here, redirect exits
    redirect('/forgot-password?error=Email is required');
  }

  // Construct the full URL for the update password page
  const redirectTo = getCallbackUrl('/update-password');

  logger.info('[Action - requestPasswordReset] Attempting password reset request', { email, redirectTo });

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    logger.error('[Action - requestPasswordReset] Password reset request failed', { error: error.message });
    // Redirect back to forgot password page with a generic error message
    redirect('/forgot-password?error=Could not send reset link. Please try again.');
  }

  // Redirect to indicate that the email has been sent
  redirect('/forgot-password?message=Check email to continue reset process');
} 