/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og"
import { env } from "@/lib/env"

export const runtime = "edge"
export const alt = env.NEXT_PUBLIC_SITE_NAME
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

/**
 * Generates a styled PNG image response for social sharing, displaying the site logo, name, and description.
 *
 * The image is rendered server-side using Next.js's edge runtime and includes branding elements sourced from environment variables.
 * The output image has fixed dimensions of 1200x630 pixels.
 *
 * @returns An ImageResponse containing the generated image.
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #ffffff, #f3f4f6)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "24px",
          }}
        >
          <img
            src={`${env.NEXT_PUBLIC_SITE_URL}/images/dfda-logo.png`}
            alt="DFDA Logo"
            width={100}
            height={100}
            style={{ marginRight: "24px" }}
          />
        </div>
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "#1f2937",
            textAlign: "center",
            marginBottom: "16px",
            lineHeight: 1.2,
          }}
        >
          {env.NEXT_PUBLIC_SITE_NAME}
        </h1>
        <p
          style={{
            fontSize: "28px",
            color: "#4b5563",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          {env.NEXT_PUBLIC_SITE_DESCRIPTION}
        </p>
      </div>
    ),
    {
      ...size,
    }
  )
} 