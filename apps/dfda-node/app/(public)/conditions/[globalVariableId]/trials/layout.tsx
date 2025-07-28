import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clinical Trials | FDA v2",
  description: "View clinical trials for a specific medical condition",
}

/**
 * Serves as a layout component that renders its child components for the clinical trials page.
 *
 * @param children - The content to be displayed within the layout
 */
export default function ConditionTrialsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 