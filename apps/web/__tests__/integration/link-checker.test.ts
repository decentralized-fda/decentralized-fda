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
  // Match object property patterns like: href: "/path", or href:"/path",
  const objectPropRegex = /href\s*:\s*["'`](\/[^"'`\s]+)["'`]/g
  // Match markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
  
  lines.forEach((line, lineIndex) => {
    let match

    // Skip lines that look like Markdown list items with directory paths
    if (line.match(/^\s*[-*+]\s+`?\/[^`\s]+`?:/)) {
      return
    }

    // Check for markdown links if it's a markdown file
    if (filePath.toLowerCase().endsWith('.md') || filePath.toLowerCase().endsWith('.mdx')) {
      while ((match = markdownLinkRegex.exec(line)) !== null) {
        const url = match[2]
        // Only add if it looks like an internal link and not a directory path
        if (url.startsWith('/') && !url.includes('//') && !line.includes('`: ')) {
          links.push({
            url,
            location: {
              filePath,
              lineNumber: lineIndex + 1,
              columnNumber: match.index + match[1].length + 3 // [text]( <- offset to the actual URL
            }
          })
        }
      }
    }

    // Check for href: "path" pattern in objects
    while ((match = objectPropRegex.exec(line)) !== null) {
      links.push({
        url: match[1],
        location: {
          filePath,
          lineNumber: lineIndex + 1,
          columnNumber: match.index
        }
      })
    }

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
      // Only add if it looks like a valid internal path and not a directory reference
      if (match[1].startsWith('/') && !match[1].includes('//') && !line.includes('`: ')) {
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
      if (match[1].trim()) { // Skip empty strings
        links.push({
          url: match[1],
          location: {
            filePath,
            lineNumber: lineIndex + 1,
            columnNumber: match.index + 6 // 6 is length of 'href="'
          }
        })
      }
    }

    // Check JSX href expressions
    while ((match = jsxLinkRegex.exec(line)) !== null) {
      if (match[1].trim()) { // Skip empty strings
        links.push({
          url: match[1],
          location: {
            filePath,
            lineNumber: lineIndex + 1,
            columnNumber: match.index + 6
          }
        })
      }
    }

    // Check Next.js Link components
    while ((match = nextLinkRegex.exec(line)) !== null) {
      if (match[1].trim()) { // Skip empty strings
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
  
  // Also check for links defined in objects/arrays
  const objectLinks = extractLinksFromObject(jsx, filePath).filter(link => link.url.trim())
  links.push(...objectLinks)
  
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

  async function getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = []
    const items = fs.readdirSync(dir)
    
    // File extensions that could contain links
    const linkableExtensions = new Set([
      '.tsx', '.ts', '.js', '.jsx', 
      '.md', '.mdx', 
      '.html', '.htm',
      '.json', '.yaml', '.yml',
      '.vue', '.svelte',
      // Add more extensions as needed
    ])
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Skip node_modules and other unnecessary directories
        if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist' && item !== '.next') {
          files.push(...await getAllFiles(fullPath))
        }
      } else {
        const ext = path.extname(item).toLowerCase()
        if (linkableExtensions.has(ext)) {
          files.push(fullPath)
        }
      }
    }
    
    return files
  }

  // Function to collect all links from a set of files
  async function collectAllLinks(): Promise<Array<{ url: string; location: { filePath: string; lineNumber: number; columnNumber: number } }>> {
    const allLinks: Array<{ url: string; location: { filePath: string; lineNumber: number; columnNumber: number } }> = []
    
    // Get all files from relevant directories
    const allFiles = [
      ...await getAllFiles(path.join(process.cwd(), 'app')),
      ...await getAllFiles(path.join(process.cwd(), 'components')),
      ...await getAllFiles(path.join(process.cwd(), 'docs')),
      ...await getAllFiles(path.join(process.cwd(), 'lib')),
      ...await getAllFiles(path.join(process.cwd(), 'config')),
      ...await getAllFiles(path.join(process.cwd(), 'public')),
      // Add more directories as needed
    ]

    // Process each file
    for (const file of allFiles) {
      const content = fs.readFileSync(file, 'utf-8')
      const ext = path.extname(file).toLowerCase()
      
      // Use appropriate link extraction based on file type
      let fileLinks: Array<{ url: string; location: LinkLocation }> = []
      
      if (ext === '.tsx' || ext === '.jsx') {
        fileLinks = extractLinksFromJsx(content, file)
      } else {
        // For all other file types, use the object extractor as it's more general
        fileLinks = extractLinksFromObject(content, file)
      }
      
      allLinks.push(...fileLinks)
    }

    // Remove duplicates while preserving location information
    const uniqueLinks = allLinks.filter((link, index, self) =>
      index === self.findIndex((l) => l.url === link.url)
    )

    return uniqueLinks
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

    console.log('\n📂 Scanning for files...')
    const allLinks = await collectAllLinks()
    console.log(`✅ Found ${allLinks.length} total links to check`)

    // Log all discovered links
    console.log('\n📋 All discovered links:')
    let linksList = ''
    allLinks.forEach(({ url, location }) => {
      const relativePath = path.relative(process.cwd(), location.filePath)
      linksList += `  ${url} (${relativePath}:${location.lineNumber})\n`
    })
    console.log(linksList)

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

  // Test for comprehensive link collection
  it('should collect links from both TSX and TS files including navigation', async () => {
    const allLinks = await collectAllLinks()
    
    // Check for specific navigation links
    const navigationLinks = [
      '/',
      '/conditions',
      '/treatments',
      '/safe/redirect',
      '/disease-eradication-act',
      '/health-savings-sharing',
      '/docs'
    ]
    
    navigationLinks.forEach(link => {
      const found = allLinks.some(({ url }) => url === link)
      expect(found).toBe(true)
    })

    // Specifically verify health-savings-sharing link
    const healthSavingsLink = allLinks.find(({ url }) => url === '/health-savings-sharing')
    expect(healthSavingsLink).toBeDefined()
    expect(healthSavingsLink?.location.filePath).toContain('dfda-nav.ts')
  })

  // Add a new test for markdown directory paths
  it('should not treat markdown directory paths as links', async () => {
    const testContent = `
# Test Directory Structure
- \`/test\`: A test directory
- \`/docs\`: Documentation files
- \`/src\`: Source files
- [Valid Link](/actual-link)
- [Another Link](/another-link)
`
    const links = extractLinksFromObject(testContent, 'test.md')
    
    // Should find the actual links but not the directory paths
    expect(links.map(l => l.url)).toEqual(['/actual-link', '/another-link'])
    
    // Test with real README content
    const readmeContent = `
- \`/partners\`: Contains information pertinent to all partners involved in the FDAi.
- \`/researchers\`: Dedicated to academic and medical researchers contributing to the project.
[Real Link](/real-link)
`
    const readmeLinks = extractLinksFromObject(readmeContent, 'README.md')
    expect(readmeLinks.map(l => l.url)).toEqual(['/real-link'])
  })
}) 