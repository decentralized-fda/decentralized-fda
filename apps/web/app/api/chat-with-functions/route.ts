import { streamText, tool } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = streamText({
      model: openai('gpt-4-vision-preview'),
      messages,
      tools: {
        getCustomDescription: tool({
          description: 'Get a custom description of an image based on a specific prompt',
          parameters: z.object({
            prompt: z.string().describe('The prompt to analyze the image with'),
            file: z.string().describe('The base64 encoded image data')
          }),
          execute: async ({ prompt, file }) => {
            const response = await fetch('/api/image2measurements', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ file, prompt, max_tokens: 100 }),
            })
            const data = await response.json()
            return data.analysis
          },
        }),
      },
    })

    return result.toDataStreamResponse()
  } catch (error) {
    // Handle any errors
    console.error('Error in chat function:', error)
    return new Response(JSON.stringify({ error: 'There was an error processing your request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
