import fs from 'fs/promises';
import path from 'path';
import { LinkInfo, ValidationResult } from '../core/types';

export async function validateInternalLink(link: LinkInfo, rootDir: string): Promise<ValidationResult> {
  try {
    // Handle absolute paths and relative paths
    const isAbsolute = link.url.startsWith('/');
    const targetPath = isAbsolute
      ? path.join(rootDir, link.url)
      : path.resolve(path.dirname(path.join(rootDir, link.location.filePath)), link.url);

    await fs.access(targetPath);
    return { isValid: true };
  } catch (e) {
    return { 
      isValid: false, 
      error: e instanceof Error ? e.message : 'File not found'
    };
  }
} 