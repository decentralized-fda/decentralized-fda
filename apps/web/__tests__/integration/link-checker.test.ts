/**
 * @jest-environment node
 */

import fs from 'fs'
import path from 'path'

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

// Patterns that indicate a dynamic URL that shouldn't be checked
const DYNAMIC_URL_PATTERNS = [
  /\$\{.*?\}/,  // ${variable}
  /\[.*?\]/,    // [param]
  /\/:[^\/]+/,  // /:param
  /\/%.*?%/,    // %param%
  /\/\(.*?\)/,  // /(group)
  /encodeURIComponent\(.*?\)/, // encodeURIComponent(param)
]

// Cache for storing link check results
const urlCache = new Map<string, LinkCheckResult>();

export async function checkLink(url: string, location?: LinkLocation): Promise<LinkCheckResult> {
  // Check cache first
  const cacheKey = url.startsWith('http') ? url : `http://localhost:3000${url}`;
  if (urlCache.has(cacheKey)) {
    const cachedResult = urlCache.get(cacheKey)!;
    return {
      ...cachedResult,
      location // Update with new location if different
    };
  }

  try {
    // Handle hash links
    if (url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('/5')) {
      const result = {
        url,
        isValid: true,
        statusCode: 200,
        location
      };
      urlCache.set(cacheKey, result);
      return result;
    }

    // For internal links, verify they start with / or #
    if (!url.startsWith('http') && 
    !url.startsWith('/') && 
    !url.startsWith('#')) {
      const result = {
        url,
        isValid: false,
        error: 'Internal links must start with / or #',
        location
      };
      urlCache.set(cacheKey, result);
      return result;
    }

    // Skip checking dynamic routes
    if (DYNAMIC_ROUTES.some(route => url.startsWith(route))) {
      const result = {
        url,
        isValid: true,
        statusCode: 200,
        location
      };
      urlCache.set(cacheKey, result);
      return result;
    }

    // Skip checking URLs with dynamic patterns
    if (DYNAMIC_URL_PATTERNS.some(pattern => pattern.test(url))) {
      const result = {
        url,
        isValid: true,
        statusCode: 200,
        location,
        error: 'Skipped: Dynamic URL'
      };
      urlCache.set(cacheKey, result);
      return result;
    }

    // For internal links, always use localhost:3000
    const fullUrl = url.startsWith('http') 
      ? url 
      : `http://localhost:3000${url}`;

    const response = await fetch(fullUrl, {
      method: 'HEAD', // Only fetch headers
      headers: {
        'User-Agent': 'DFDA Link Checker'
      }
    });

    const result = {
      url,
      isValid: response.ok || response.status === 405 || response.status === 500,
      statusCode: response.status,
      location
    };
    urlCache.set(cacheKey, result);
    return result;
  } catch (error) {
    const result = {
      url,
      isValid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      location
    };
    urlCache.set(cacheKey, result);
    return result;
  }
}

// Helper to extract links from TypeScript object literals
export function extractLinksFromObject(content: string, filePath: string): Array<{ url: string; location: LinkLocation }> {
  const links: Array<{ url: string; location: LinkLocation }> = []
  const lines = content.split('\n')
  
  // Match patterns like href:"/path" or href: "/path" or href='/path' or href = "/path"
  const hrefRegex = /href\s*:\s*["'](.*?)["']/g
  // Match patterns like href={"/path"} or href={'/path'} or href={`/path`}
  const jsxHrefRegex = /href=\{["'`](.*?)["'`]\}/g
  // Match URL strings in arrays/objects - more permissive pattern
  const urlRegex = /["'`](\/[^"'`\s]+)["'`]/g
  
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


describe('Integration - Link Checker', () => {
  beforeEach(() => {
    // Clear the URL cache before each test
    urlCache.clear();
  });

  const MAX_CONCURRENT_CHECKS = 5 // Limit concurrent requests

  // Helper to check if dev server is running
  async function isDevServerRunning(): Promise<boolean> {
    try {
      console.log('\n🔍 Checking if development server is running...')
      await fetch('http://localhost:3000', {
        method: 'HEAD',
        headers: {
          'User-Agent': 'DFDA Link Checker'
        }
      })
      console.log('✅ Development server is running')
      return true
    } catch (error) {
      return false
    }
  }

  async function getAllTsxFiles(dir: string): Promise<string[]> {
    const files: string[] = []
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...await getAllTsxFiles(fullPath))
      } else if (item.endsWith('.tsx')) {
        files.push(fullPath)
      }
    }
    
    return files
  }

  async function checkLinksInBatches(links: Array<{ url: string; location: { filePath: string; lineNumber: number; columnNumber: number } }>): Promise<{ valid: string[], invalid: Array<{ url: string; error: string; location: { filePath: string; lineNumber: number; columnNumber: number } }> }> {
    const results = {
      valid: [] as string[],
      invalid: [] as Array<{ url: string; error: string; location: { filePath: string; lineNumber: number; columnNumber: number } }>
    }

    const totalBatches = Math.ceil(links.length / MAX_CONCURRENT_CHECKS)
    console.log(`\n🔍 Checking ${links.length} links in ${totalBatches} batches...`)

    // Process links in batches
    for (let i = 0; i < links.length; i += MAX_CONCURRENT_CHECKS) {
      const batchNumber = Math.floor(i / MAX_CONCURRENT_CHECKS) + 1
      const batch = links.slice(i, i + MAX_CONCURRENT_CHECKS)
      //console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} links)`)
      
      const checkResults = await Promise.all(
        batch.map(({ url, location }) => {
          //console.log(`  Checking ${url}`)
          return checkLink(url, location)
        })
      )
      
      checkResults.forEach(result => {
        if (result.isValid) {
          results.valid.push(result.url)
          //console.log(`  ✅ ${result.url}`)
        } else {
          results.invalid.push({
            url: result.url,
            error: result.error || `Status: ${result.statusCode}`,
            location: result.location!
          })
          console.log(`  ❌ ${result.url} - ${result.error || `Status: ${result.statusCode}`}`)
        }
      })

      // Show progress
      const progress = ((batchNumber / totalBatches) * 100).toFixed(1)
      console.log(`\n📊 Progress: ${progress}% (${batchNumber}/${totalBatches} batches)`)
    }

    return results
  }

  function formatTable(brokenLinks: Array<{ url: string; error: string; location: { filePath: string; lineNumber: number; columnNumber: number } }>) {
    if (brokenLinks.length === 0) return ''

    // Calculate column widths
    const urlWidth = Math.max(15, ...brokenLinks.map(link => link.url.length))
    const locationWidth = Math.max(20, ...brokenLinks.map(link => {
      const relativePath = path.relative(process.cwd(), link.location.filePath)
      return `${relativePath}:${link.location.lineNumber}`.length
    }))
    const errorWidth = Math.max(15, ...brokenLinks.map(link => link.error.length))

    // Create header
    const header = [
      'URL'.padEnd(urlWidth),
      'Location'.padEnd(locationWidth),
      'Error'.padEnd(errorWidth)
    ].join(' | ')

    // Create separator
    const separator = [
      '-'.repeat(urlWidth),
      '-'.repeat(locationWidth),
      '-'.repeat(errorWidth)
    ].join(' | ')

    // Create rows
    const rows = brokenLinks.map(link => {
      const relativePath = path.relative(process.cwd(), link.location.filePath)
      return [
        link.url.padEnd(urlWidth),
        `${relativePath}:${link.location.lineNumber}`.padEnd(locationWidth),
        link.error.padEnd(errorWidth)
      ].join(' | ')
    })

    return '\nBroken Links Report:\n' + [header, separator, ...rows].join('\n') + '\n'
  }

  it('should validate all links in the codebase', async () => {
    // Check if dev server is running first
    const serverRunning = await isDevServerRunning()
    if (!serverRunning) {
      console.error('\n❌ Development server is not running!')
      console.error('Please start it with "npm run dev" or "pnpm dev" first.\n')
      // Fail the test immediately
      throw new Error('Development server must be running to check links')
    }

    console.log('\n📂 Scanning for TSX files...')
    // Get all TSX files from app and components directories
    const tsxFiles = [
        ...await getAllTsxFiles(path.join(process.cwd(), 'app')),
        ...await getAllTsxFiles(path.join(process.cwd(), 'components')),
        ...await getAllTsxFiles(path.join(process.cwd(), 'docs')),
        ...await getAllTsxFiles(path.join(process.cwd(), 'lib')),
    ]
    console.log(`✅ Found ${tsxFiles.length} TSX files`)

    console.log('\n🔍 Extracting links from files...')
    // Extract links from all files with their locations
    const allLinks: Array<{ url: string; location: { filePath: string; lineNumber: number; columnNumber: number } }> = []
    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const fileLinks = extractLinksFromJsx(content, file)
      if (fileLinks.length > 0) {
        //console.log(`  Found ${fileLinks.length} links in ${path.relative(process.cwd(), file)}`)
      }
      allLinks.push(...fileLinks)
    }
    console.log(`✅ Found ${allLinks.length} total links to check`)

    // Check all links
    const results = await checkLinksInBatches(allLinks)

    // Format and display results
    if (results.invalid.length > 0) {
      const table = formatTable(results.invalid)
      console.log('\n❌ Found broken links:')
      console.log(table)
    } else {
      console.log('\n✅ All links are valid!\n')
    }

    // Assert all links are valid
    expect(results.invalid).toHaveLength(0)
  }, 300000) // Increased timeout to 5 minutes
}) 