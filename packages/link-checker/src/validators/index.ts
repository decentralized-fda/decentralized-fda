import { LinkValidator } from '../types';
import { validateInternalLink } from './internal';
import { validateExternalLink } from './external';

export const validateLink: LinkValidator = (url: string, line?: string): boolean => {
  // Clean the URL of any trailing punctuation
  const cleanUrl = url.replace(/[.,;:!?)*\]]+$/, '');

  // Route to appropriate validator
  if (cleanUrl.startsWith('/')) {
    return validateInternalLink(cleanUrl, line);
  } else if (cleanUrl.startsWith('http')) {
    return validateExternalLink(cleanUrl);
  }

  return false;
}; 