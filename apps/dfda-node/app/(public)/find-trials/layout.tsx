import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Find Clinical Trials | FDA v2",
  description: "Search for clinical trials by medical condition",
}

/**
 * Layout component that renders its child components for the "Find Clinical Trials" page.
 *
 * @param children - The content to be displayed within the layout
 * @returns The rendered child components
 */
export default function FindTrialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 