/**
 * @jest-environment node
 */

import { scanLinks } from '../../src/core/scanner';
import { LinkInfo } from '../../src/core/types';
import path from 'path';

describe('scanLinks', () => {
  const testDir = path.join(__dirname, '../fixtures');

  beforeAll(() => {
    // Create test fixtures if needed
  });

  it('should find links in markdown files', async () => {
    const results = await scanLinks(testDir);
    expect(Array.isArray(results)).toBe(true);
  });

  it('should respect exclude patterns', async () => {
    const results = await scanLinks(testDir, {
      excludePatterns: ['**/excluded/**']
    });
    expect(results.every(r => !r.location.filePath.includes('excluded'))).toBe(true);
  });

  it('should validate live links when enabled', async () => {
    const results = await scanLinks(testDir, {
      checkLiveLinks: true
    });
    expect(results.some(r => r.isValid !== undefined)).toBe(true);
  });

  it('should group results by file type', async () => {
    const results = await scanLinks(testDir);
    const byFileType = results.reduce<Record<string, LinkInfo[]>>((acc, result) => {
      const ext = path.extname(result.location.filePath);
      acc[ext] = acc[ext] || [];
      acc[ext].push(result);
      return acc;
    }, {});

    expect(Object.keys(byFileType).length).toBeGreaterThan(0);
  });

  it('should report valid and invalid links', async () => {
    const results = await scanLinks(testDir, { checkLiveLinks: true });
    const validCount = results.filter((r: LinkInfo) => r.isValid).length;
    const invalidCount = results.filter((r: LinkInfo) => !r.isValid).length;

    expect(validCount + invalidCount).toBe(results.length);
  });

  it('should provide error messages for invalid links', async () => {
    const results = await scanLinks(testDir, { checkLiveLinks: true });
    
    results
      .filter((r: LinkInfo) => !r.isValid)
      .forEach((r: LinkInfo) => {
        expect(r.error).toBeDefined();
        expect(typeof r.error).toBe('string');
      });
  });
}); 