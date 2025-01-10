/**
 * @jest-environment node
 */

import { extractLinks } from '../../src/extractors';
import { validateInternalLink } from '../../src/validators/internal';
import { validateExternalLink } from '../../src/validators/external';
import { LinkInfo } from '../../src/core/types';
import path from 'path';

describe('Link Checker', () => {
  const testDir = path.join(__dirname, '../fixtures');

  describe('extractLinks', () => {
    it('should extract markdown links', () => {
      const content = `
# Test
[Link 1](https://example.com)
[Link 2](./local-file.md)
      `;
      const links = extractLinks(content, 'test.md');
      expect(links).toHaveLength(2);
      expect(links[0].url).toBe('https://example.com');
      expect(links[1].url).toBe('./local-file.md');
    });

    it('should extract HTML/JSX links', () => {
      const content = `
<a href="https://example.com">Link</a>
<img src="./image.png" />
      `;
      const links = extractLinks(content, 'test.tsx');
      expect(links).toHaveLength(2);
      expect(links[0].url).toBe('https://example.com');
      expect(links[1].url).toBe('./image.png');
    });
  });

  describe('validateInternalLink', () => {
    it('should validate local file links', async () => {
      const link: LinkInfo = {
        url: './sample.md',
        location: {
          filePath: 'test.md',
          lineNumber: 1
        }
      };
      const result = await validateInternalLink(link, testDir);
      expect(result.isValid).toBe(true);
    });

    it('should fail for non-existent files', async () => {
      const link: LinkInfo = {
        url: './non-existent.md',
        location: {
          filePath: 'test.md',
          lineNumber: 1
        }
      };
      const result = await validateInternalLink(link, testDir);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('validateExternalLink', () => {
    it('should validate external URLs', async () => {
      const link: LinkInfo = {
        url: 'https://www.google.com',
        location: {
          filePath: 'test.md',
          lineNumber: 1
        }
      };
      const result = await validateExternalLink(link);
      expect(result.isValid).toBe(true);
    });

    it('should fail for invalid URLs', async () => {
      const link: LinkInfo = {
        url: 'https://this-is-an-invalid-domain-12345.com',
        location: {
          filePath: 'test.md',
          lineNumber: 1
        }
      };
      const result = await validateExternalLink(link);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
}); 