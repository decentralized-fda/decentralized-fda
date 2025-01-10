import { LinkInfo } from '../core/types';

// Regular expressions for different types of links
const MARKDOWN_LINK_REGEX = /\[([^\]]*)\]\(([^)]+)\)/g;
const URL_REGEX = /(?<![(\[])https?:\/\/[^\s<>"')\]]+/g;
const HTML_LINK_REGEX = /(?:href|src)=["']([^"']+)["']/g;

export function extractLinks(content: string, filePath: string): LinkInfo[] {
  const links = new Map<string, LinkInfo>();
  let match;

  // Extract Markdown links
  while ((match = MARKDOWN_LINK_REGEX.exec(content)) !== null) {
    const url = match[2].trim();
    if (!links.has(url)) {
      links.set(url, {
        url,
        location: {
          filePath,
          lineNumber: getLineNumber(content, match.index),
          columnNumber: getColumnNumber(content, match.index)
        }
      });
    }
  }

  // Extract raw URLs
  while ((match = URL_REGEX.exec(content)) !== null) {
    const url = match[0].trim();
    if (!links.has(url)) {
      links.set(url, {
        url,
        location: {
          filePath,
          lineNumber: getLineNumber(content, match.index),
          columnNumber: getColumnNumber(content, match.index)
        }
      });
    }
  }

  // Extract HTML/JSX links
  while ((match = HTML_LINK_REGEX.exec(content)) !== null) {
    const url = match[1].trim();
    if (!links.has(url)) {
      links.set(url, {
        url,
        location: {
          filePath,
          lineNumber: getLineNumber(content, match.index),
          columnNumber: getColumnNumber(content, match.index)
        }
      });
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