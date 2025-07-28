import type React from "react"

/**
 * Renders child components within a layout wrapper without adding extra markup.
 *
 * @param children - The content to be rendered inside the layout
 */
export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

