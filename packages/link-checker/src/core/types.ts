export interface LinkLocation {
  filePath: string;
  lineNumber: number;
  columnNumber?: number;
}

export interface LinkInfo {
  url: string;
  location: LinkLocation;
  isValid?: boolean;
  error?: string;
}

export interface ScanOptions {
  // Whether to validate external URLs (HTTP/HTTPS)
  checkLiveLinks?: boolean;
  
  // Glob patterns for files to include in the scan
  includePatterns?: string[];
  
  // Glob patterns for files to exclude from the scan
  excludePatterns?: string[];
  
  // Maximum number of concurrent requests for link validation
  concurrent?: number;
  
  // Timeout in milliseconds for external link validation
  timeout?: number;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
} 