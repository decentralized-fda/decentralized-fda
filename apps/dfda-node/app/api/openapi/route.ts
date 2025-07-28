import { NextResponse } from 'next/server';
import { fetchAndProcessOpenApiSpec } from '@/lib/openapi-fetcher';

/**
 * Handles GET requests by returning the processed OpenAPI specification as a JSON response.
 *
 * Responds with a 500 status and error message if the specification cannot be loaded.
 */
export async function GET() {
  const spec = await fetchAndProcessOpenApiSpec();
  if (!spec) {
    return NextResponse.json({ error: 'Failed to load OpenAPI spec' }, { status: 500 });
  }
  return NextResponse.json(spec);
} 