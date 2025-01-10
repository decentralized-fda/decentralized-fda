/**
 * @jest-environment node
 */

import fs from 'fs'
import path from 'path'

// Configuration for folder scanning
const INCLUDED_FOLDERS = [
  'app',
  'components',
  'docs',
  'lib',
  'config',
  'public',
  // Add more folders to include
]

const EXCLUDED_FOLDERS = [
  'node_modules',
  '.next',
  'dist',
  '.git',
  'coverage',
  'test-results',
  // Add specific subfolders to exclude even if they're in included folders
  'public/assets',
  'docs/generated',
  'public/docs/api-docs',
  // Add more folders to exclude
]

// Patterns for excluding links
const EXCLUSION_PATTERNS = {
  // Template literals and variables
  templateLiterals: [
    /\$\{.*?\}/,  // ${variable}
    /{.*?}/,      // {variable}
  ],
  // Special protocols
  protocols: [
    /^mailto:/,
    /^tel:/,
    /^sms:/,
  ],
  // Numeric paths
  numericPaths: [
    /^\/\d+$/,    // /5, /0, etc
  ],
  // API and dynamic routes
  dynamicRoutes: [
    /\/api\/.*?\$/, // API routes with parameters
    /\[.*?\]/,      // [param]
    /\/:[^\/]+/,    // /:param
    /\/%.*?%/,      // %param%
    /\/\(.*?\)/,    // /(group)
    /encodeURIComponent\(.*?\)/, // encodeURIComponent(param)
  ],
  // Invalid paths
  invalidPaths: [
    /^\/$/,      // Just /
    /\/\//,      // Double slashes
    /^\/\s*$/,   // Empty or whitespace after /
  ],
  // Code examples and units
  codeExamples: [
    /`.*?\/\d+.*?`/,  // `/5` in backticks
    /unit.*?\/\d+/i,  // unit/5 (case insensitive)
  ],
  // Directory documentation
  directoryDocs: [
    /^\s*[-*+]\s+`?\/[^`\s]+`?:/m,  // Markdown list items with directory paths
  ]
}

// File extensions that could contain links
const LINKABLE_EXTENSIONS = new Set([
  '.tsx', '.ts', '.js', '.jsx', 
  '.md', '.mdx', 
  '.html', '.htm',
  '.json', '.yaml', '.yml',
  '.vue', '.svelte',
  // Add more extensions as needed
])

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
  location: LinkLocation;
}

// Routes that are dynamic and shouldn't be checked
const DYNAMIC_ROUTES = [
  '/userVariables/[variableId]',
  '/globalVariables/[variableId]',
  '/conditions/[conditionName]',
  '/treatments/[treatmentName]',
]

// Cache for storing link check results
const urlCache = new Map<string, LinkCheckResult>();

export async function checkLink(url: string, location: LinkLocation): Promise<LinkCheckResult> {
  // Check cache first
  const cacheKey = url.startsWith('http') ? url : `http://localhost:3000${url}`;
  if (urlCache.has(cacheKey)) {
    const cachedResult = urlCache.get(cacheKey)!;
    return {
      ...cachedResult,
      location // Always use the provided location
    };
  }

  try {
    // For internal links, verify they start with / or are http(s)
    if (!url.startsWith('http') && !url.startsWith('/')) {
      const result = {
        url,
        isValid: false,
        error: 'Internal links must start with /',
        location
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

// Helper function to validate internal links
function isValidInternalLink(url: string, line?: string): boolean {
  // Must start with / and contain at least one character after
  if (!url.startsWith('/') || url.length < 2) {
    return false
  }

  // Check against all exclusion patterns
  for (const category of Object.values(EXCLUSION_PATTERNS)) {
    for (const pattern of category) {
      if (pattern.test(url)) {
        return false
      }
    }
  }

  // Check line context if provided
  if (line) {
    // Check for code examples and directory documentation in the line context
    for (const pattern of [...EXCLUSION_PATTERNS.codeExamples, ...EXCLUSION_PATTERNS.directoryDocs]) {
      if (pattern.test(line)) {
        return false
      }
    }
  }

  return true
}

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

    // Check for markdown links if it's a markdown file
    if (filePath.toLowerCase().endsWith('.md') || filePath.toLowerCase().endsWith('.mdx')) {
      while ((match = markdownLinkRegex.exec(line)) !== null) {
        const url = match[2]
        if (isValidInternalLink(url, line)) {
          links.push({
            url,
            location: {
              filePath,
              lineNumber: lineIndex + 1,
              columnNumber: match.index + match[1].length + 3
            }
          })
        }
      }
    }

    // Check for href: "path" pattern in objects
    while ((match = objectPropRegex.exec(line)) !== null) {
      const url = match[1]
      if (isValidInternalLink(url, line)) {
        links.push({
          url,
          location: {
            filePath,
            lineNumber: lineIndex + 1,
            columnNumber: match.index
          }
        })
      }
    }

    // Check for href: "path" pattern
    while ((match = hrefRegex.exec(line)) !== null) {
      const url = match[1]
      if (isValidInternalLink(url, line)) {
        links.push({
          url,
          location: {
            filePath,
            lineNumber: lineIndex + 1,
            columnNumber: match.index
          }
        })
      }
    }

    // Check for href={"path"} pattern
    while ((match = jsxHrefRegex.exec(line)) !== null) {
      const url = match[1]
      if (isValidInternalLink(url, line)) {
        links.push({
          url,
          location: {
            filePath,
            lineNumber: lineIndex + 1,
            columnNumber: match.index
          }
        })
      }
    }

    // Check for URL strings in arrays/objects
    while ((match = urlRegex.exec(line)) !== null) {
      const url = match[1]
      if (isValidInternalLink(url, line)) {
        links.push({
          url,
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
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const relativePath = path.relative(process.cwd(), fullPath)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Skip if this directory is in the exclusion list
        if (EXCLUDED_FOLDERS.some(excluded => 
          relativePath === excluded || // Exact match
          relativePath.startsWith(excluded + path.sep) || // Subfolder match
          relativePath.startsWith('.' + path.sep + excluded) // Hidden folder match
        )) {
          continue
        }
        files.push(...await getAllFiles(fullPath))
      } else {
        const ext = path.extname(item).toLowerCase()
        if (LINKABLE_EXTENSIONS.has(ext)) {
          files.push(fullPath)
        }
      }
    }
    
    return files
  }

  // Function to collect all links from a set of files
  async function collectAllLinks(): Promise<Array<{ url: string; location: { filePath: string; lineNumber: number; columnNumber: number } }>> {
    const allLinks: Array<{ url: string; location: { filePath: string; lineNumber: number; columnNumber: number } }> = []
    
    // Get all files from included directories, respecting exclusions
    const allFiles = (await Promise.all(
      INCLUDED_FOLDERS.map(async folder => 
        await getAllFiles(path.join(process.cwd(), folder))
      )
    )).flat()

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
      
      // Filter out invalid links before adding them
      const validLinks = fileLinks.filter(link => isValidInternalLink(link.url))
      allLinks.push(...validLinks)
    }

    // Remove duplicates while preserving location information of the first occurrence
    const uniqueLinks = allLinks.filter((link, index, self) =>
      index === self.findIndex((l) => l.url === link.url)
    )

    // Sort links for consistent output
    return uniqueLinks.sort((a, b) => a.url.localeCompare(b.url))
  }

  async function checkLinksInBatches(links: Array<{ url: string; location: { filePath: string; lineNumber: number; columnNumber: number } }>): Promise<{ valid: string[]; invalid: Array<{ url: string; error: string; location: { filePath: string; lineNumber: number; columnNumber: number } }> }> {
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
            location: result.location
          })
          console.log(`  ❌ ${result.url} - ${result.error || `Status: ${result.statusCode}`}
            ${result.location.filePath}:${result.location.lineNumber}`)
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

  // Add test for link validation
  it('should filter out invalid internal links', () => {
    const testContent = `
      href="/valid/path"
      href="/0"
      href="/5"
      href="mailto:test@example.com"
      href="/api/userVariables/\${userVariableId}"
      href="/api/[param]"
      href="/"
      href="//"
      href="/valid-path"
      [Link](/valid/path)
      [Invalid](/0)
      [Email](mailto:test@example.com)
      [Template]/api/\${variable})
    `
    const links = extractLinksFromObject(testContent, 'test.txt')
    
    // Should only include valid internal paths
    const validUrls = links.map(l => l.url)
    expect(validUrls).toContain('/valid/path')
    expect(validUrls).toContain('/valid-path')
    
    // Should not include invalid paths
    expect(validUrls).not.toContain('/0')
    expect(validUrls).not.toContain('/5')
    expect(validUrls).not.toContain('mailto:test@example.com')
    expect(validUrls).not.toContain('/api/userVariables/${userVariableId}')
    expect(validUrls).not.toContain('/api/[param]')
    expect(validUrls).not.toContain('/')
    expect(validUrls).not.toContain('//')
  })
}) 