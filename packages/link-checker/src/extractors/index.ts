import { LinkInfo } from '../core/types';

// Regular expressions for different types of links
const MARKDOWN_LINK_REGEX = /\[([^\]]*?)\]\(([^)]*)\)?|\[([^\]]*?)\]\(\)?|\[([^\]]*?)(?=\n|$)/g;
const URL_REGEX = /(?<![(\[])https?:\/\/[^\s<>"')\]]+/g;
const HTML_LINK_REGEX = /(?:href|src)=["']([^"']+)["']/g;
const IMPORT_REGEX = /(?:import|require)\(?['"]([^'"]+)['"]\)?/g;
const DYNAMIC_IMPORT_REGEX = /dynamic\(\(\)\s*=>\s*import\(['"]([^'"]+)['"]\)\)/g;
const CSS_MODULE_REGEX = /from\s+['"]([^'"]+\.module\.css)['"]/g;

export function extractLinks(content: string, filePath: string): LinkInfo[] {
  const links = new Map<string, LinkInfo>();
  const orderedLinks: LinkInfo[] = [];
  let match;

  // Extract Markdown links
  while ((match = MARKDOWN_LINK_REGEX.exec(content)) !== null) {
    const url = match[2].trim();
    if (!links.has(url)) {
      const linkInfo = {
        url,
        location: {
          filePath,
          lineNumber: getLineNumber(content, match.index),
          columnNumber: getColumnNumber(content, match.index)
        }
      };
      links.set(url, linkInfo);
      orderedLinks.push(linkInfo);
    }
  }

  // Extract raw URLs
  while ((match = URL_REGEX.exec(content)) !== null) {
    const url = match[0].trim();
    if (!links.has(url)) {
      const linkInfo = {
        url,
        location: {
          filePath,
          lineNumber: getLineNumber(content, match.index),
          columnNumber: getColumnNumber(content, match.index)
        }
      };
      links.set(url, linkInfo);
      orderedLinks.push(linkInfo);
    }
  }

  // Extract HTML/JSX links
  while ((match = HTML_LINK_REGEX.exec(content)) !== null) {
    const url = match[1].trim();
    if (!links.has(url)) {
      const linkInfo = {
        url,
        location: {
          filePath,
          lineNumber: getLineNumber(content, match.index),
          columnNumber: getColumnNumber(content, match.index)
        }
      };
      links.set(url, linkInfo);
      orderedLinks.push(linkInfo);
    }
  }

  // Extract JavaScript/TypeScript imports
  while ((match = IMPORT_REGEX.exec(content)) !== null) {
    const url = match[1].trim();
    if (!links.has(url)) {
      const linkInfo = {
        url,
        location: {
          filePath,
          lineNumber: getLineNumber(content, match.index),
          columnNumber: getColumnNumber(content, match.index)
        }
      };
      links.set(url, linkInfo);
      orderedLinks.push(linkInfo);
    }
  }

  // Extract Next.js dynamic imports
  while ((match = DYNAMIC_IMPORT_REGEX.exec(content)) !== null) {
    const url = match[1].trim();
    if (!links.has(url)) {
      const linkInfo = {
        url,
        location: {
          filePath,
          lineNumber: getLineNumber(content, match.index),
          columnNumber: getColumnNumber(content, match.index)
        }
      };
      links.set(url, linkInfo);
      orderedLinks.push(linkInfo);
    }
  }

  // Extract CSS module imports
  while ((match = CSS_MODULE_REGEX.exec(content)) !== null) {
    const url = match[1].trim();
    if (!links.has(url)) {
      const linkInfo = {
        url,
        location: {
          filePath,
          lineNumber: getLineNumber(content, match.index),
          columnNumber: getColumnNumber(content, match.index)
        }
      };
      links.set(url, linkInfo);
      orderedLinks.push(linkInfo);
    }
  }

  return Array.from(links.values());
}

function getLineNumber(content: string, index: number): number {
  return content.slice(0, index).split('\n').length;
}

function getColumnNumber(content: string, index: number): number {
  const lastNewline = content.lastIndexOf('\n', index);
  return lastNewline === -1 ? index + 1 : index - lastNewline;
}
