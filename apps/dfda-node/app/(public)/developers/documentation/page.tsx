import Link from "next/link"
import { ArrowLeft, Menu } from "lucide-react"
import { DocSidebar } from "@/components/developers/DocSidebar"
import { DocContent } from "@/components/developers/DocContent"
import { Button } from "@/components/ui/button"
import type { Metadata } from 'next';
import { getMetadataFromNavKey } from '@/lib/metadata';

/**
 * Generates metadata for the developer documentation page.
 *
 * @returns A promise that resolves to the page metadata.
 */
export async function generateMetadata(): Promise<Metadata> {
  return getMetadataFromNavKey('developers_documentation');
}

/**
 * Renders the developer API documentation page layout with a sidebar and main content area.
 *
 * Displays a responsive interface including a back navigation link, page title, mobile menu toggle, sidebar navigation, and documentation content.
 */
export default function DeveloperDocumentation() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 py-6 md:py-10">
        <div className="container">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link href="/developers" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Developer Portal</span>
              </Link>
              <h1 className="text-2xl font-bold">API Documentation</h1>
            </div>
            <div className="lg:hidden">
              <Button variant="outline" size="sm" id="mobile-doc-menu-toggle">
                <Menu className="h-4 w-4 mr-2" />
                Menu
              </Button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Wrap DocSidebar in a div with fixed dimensions to prevent ResizeObserver issues */}
            <div
              className="w-full lg:w-64 shrink-0 hidden lg:block overflow-visible"
              id="doc-sidebar-container"
              style={{ height: "auto", position: "relative" }}
            >
              <DocSidebar />
            </div>
            <div className="flex-1">
              <DocContent />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

