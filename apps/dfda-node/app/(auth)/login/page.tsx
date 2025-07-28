// import Link from "next/link"
import { LoginForm } from "./login-form"
import type { Metadata } from 'next';
import { getMetadataFromNavKey } from '@/lib/metadata';

/**
 * Generates and returns metadata for the login page.
 *
 * @returns A promise that resolves to the metadata for the login page.
 */
export async function generateMetadata(): Promise<Metadata> {
  return getMetadataFromNavKey('login');
}

/**
 * Renders the login page with a centered login form.
 *
 * Displays the `LoginForm` component within a styled container that centers the content both vertically and horizontally.
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-theme(spacing.16))] flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      {/* <Link href="/" className="text-muted-foreground hover:text-foreground">
        Back to Home
      </Link> */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8">
        <LoginForm />
      </div>
    </div>
  );
}

