/**
 * Lesson Formatting Utilities
 * Helpers for rendering lesson content with enhanced styling
 */

/**
 * Detect if a code block contains C keywords (all caps single words)
 */
export function isKeywordList(content: string): boolean {
  const lines = content.trim().split('\n').filter(line => line.trim());
  if (lines.length < 10) return false; // Keyword lists are typically long
  
  // Check if most lines contain space-separated words
  const keywordLines = lines.filter(line => {
    const words = line.trim().split(/\s+/);
    return words.length >= 2 && words.every(word => /^[a-z_]+$/.test(word));
  });
  
  return keywordLines.length / lines.length > 0.7;
}

/**
 * Convert keyword list text to array of keywords
 */
export function parseKeywords(content: string): string[] {
  return content
    .trim()
    .split(/\s+/)
    .filter(word => word.trim().length > 0);
}

/**
 * Format keyword list with grid styling info
 */
export interface FormattedKeywordList {
  keywords: string[];
  shouldRenderAsGrid: boolean;
}

export function formatKeywordList(content: string): FormattedKeywordList {
  const keywords = parseKeywords(content);
  const shouldRenderAsGrid = keywords.length >= 15; // Render as grid if 15+ keywords
  
  return {
    keywords,
    shouldRenderAsGrid
  };
}
