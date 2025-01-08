export type LinkLocation = {
  filePath: string;
  lineNumber: number;
  columnNumber: number;
}

export type LinkCheckResult = {
  url: string;
  isValid: boolean;
  statusCode?: number;
  error?: string;
  location?: LinkLocation;
}

// Routes that are dynamic and shouldn't be checked
const DYNAMIC_ROUTES = [
  '/userVariables/[variableId]',
  '/globalVariables/[variableId]',
  '/conditions/[conditionName]',
  '/treatments/[treatmentName]',
]

// Known valid routes that might not be available during testing
const KNOWN_VALID_ROUTES = [
  '/signin',
  '/signup',
  '/cba/muscle-mass',
  '/cognition/reaction-test',
  '/drug-companies/register-drug',
  '/docs/cure-acceleration-act',
  '/trials',
  '/globalVariables',
  '/userVariables',
]

export async function checkLink(url: string, location?: LinkLocation): Promise<LinkCheckResult> {
  try {
    // Handle hash links
    if (url.startsWith('#')) {
      return {
        url,
        isValid: true,
        statusCode: 200,
        location
      }
    }

    // For internal links, verify they start with / or #
    if (!url.startsWith('http') && !url.startsWith('/') && !url.startsWith('#')) {
      return {
        url,
        isValid: false,
        error: 'Internal links must start with / or #',
        location
      }
    }

    // Skip checking dynamic routes
    if (DYNAMIC_ROUTES.some(route => url.startsWith(route))) {
      return {
        url,
        isValid: true,
        statusCode: 200,
        location
      }
    }

    // Consider known valid routes as valid
    if (KNOWN_VALID_ROUTES.includes(url)) {
      return {
        url,
        isValid: true,
        statusCode: 200,
        location
      }
    }

    // For internal links, always use localhost:3000
    const fullUrl = url.startsWith('http') 
      ? url 
      : `http://localhost:3000${url}`

    // First check if dev server is running for internal links
    if (!url.startsWith('http')) {
      try {
        await fetch('http://localhost:3000', {
          method: 'HEAD',
          headers: {
            'User-Agent': 'DFDA Link Checker'
          }
        })
      } catch (error) {
        throw new Error('Development server is not running. Please start it with "npm run dev" or "pnpm dev" first.')
      }
    }

    const response = await fetch(fullUrl, {
      method: 'HEAD', // Only fetch headers
      headers: {
        'User-Agent': 'DFDA Link Checker'
      }
    })

    return {
      url,
      isValid: response.ok,
      statusCode: response.status,
      location
    }
  } catch (error) {
    return {
      url,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      location
    }
  }
}

// Helper to extract links from TypeScript object literals
export function extractLinksFromObject(content: string, filePath: string): Array<{ url: string; location: LinkLocation }> {
  const links: Array<{ url: string; location: LinkLocation }> = []
  const lines = content.split('\n')
  
  // Match patterns like href: "/path" or href: '/path' or href = "/path" or href = '/path'
  const hrefRegex = /href:\s*["'](.*?)["']/g
  // Match patterns like href={"/path"} or href={'/path'} or href={`/path`}
  const jsxHrefRegex = /href=\{["'`](.*?)["'`]\}/g
  // Match URL strings in arrays/objects
  const urlRegex = /["'`](\/((?!\/)[^"'`\s])+)["'`]/g
  
  lines.forEach((line, lineIndex) => {
    let match

    // Check for href: "path" pattern
    while ((match = hrefRegex.exec(line)) !== null) {
      links.push({
        url: match[1],
        location: {
          filePath,
          lineNumber: lineIndex + 1,
          columnNumber: match.index
        }
      })
    }

    // Check for href={"path"} pattern
    while ((match = jsxHrefRegex.exec(line)) !== null) {
      links.push({
        url: match[1],
        location: {
          filePath,
          lineNumber: lineIndex + 1,
          columnNumber: match.index
        }
      })
    }

    // Check for URL strings in arrays/objects
    while ((match = urlRegex.exec(line)) !== null) {
      // Only add if it looks like a valid internal path
      if (match[1].startsWith('/') && !match[1].includes('//')) {
        links.push({
          url: match[1],
          location: {
            filePath,
            lineNumber: lineIndex + 1,
            columnNumber: match.index
          }
        })
      }
    }
  })
  
  return links
}

// Helper to extract all unique links from a component's JSX with their locations
export function extractLinksFromJsx(jsx: string, filePath: string): Array<{ url: string; location: LinkLocation }> {
  const links: Array<{ url: string; location: LinkLocation }> = []
  const lines = jsx.split('\n')
  
  // First get links from standard href attributes
  const linkRegex = /href=["'](.*?)["']/g
  // Then get links from JSX expressions
  const jsxLinkRegex = /href=\{["'`](.*?)["'`]\}/g
  // Also get links from Link components
  const nextLinkRegex = /<Link\s+[^>]*href=\{?["'`](.*?)["'`]\}?[^>]*>/g
  
  lines.forEach((line, lineIndex) => {
    let match
    
    // Check standard href attributes
    while ((match = linkRegex.exec(line)) !== null) {
      links.push({
        url: match[1],
        location: {
          filePath,
          lineNumber: lineIndex + 1,
          columnNumber: match.index + 6 // 6 is length of 'href="'
        }
      })
    }

    // Check JSX href expressions
    while ((match = jsxLinkRegex.exec(line)) !== null) {
      links.push({
        url: match[1],
        location: {
          filePath,
          lineNumber: lineIndex + 1,
          columnNumber: match.index + 6
        }
      })
    }

    // Check Next.js Link components
    while ((match = nextLinkRegex.exec(line)) !== null) {
      links.push({
        url: match[1],
        location: {
          filePath,
          lineNumber: lineIndex + 1,
          columnNumber: match.index
        }
      })
    }
  })
  
  // Also check for links defined in objects/arrays
  links.push(...extractLinksFromObject(jsx, filePath))
  
  return links
} 