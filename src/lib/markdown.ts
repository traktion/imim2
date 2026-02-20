import TurndownService from 'turndown';
import { marked } from 'marked';

// Remove empty <p> tags and trim whitespace
export function sanitizeHtml(html: string): string {
  // remove <p>...</p> where content is only whitespace or <br>
  const withoutEmptyPs = html
    .replace(/<p>(\s|<br\s*\/?\s*>|&nbsp;)*<\/p>/gi, '')
    .replace(/\n{3,}/g, '\n\n');
  return withoutEmptyPs.trim();
}

// Normalize markdown whitespace (trim, CRLF -> LF, collapse trailing spaces)
export function normalizeMarkdown(md: string): string {
  return md
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trim();
}

export function htmlToMarkdown(html: string): string {
  const clean = sanitizeHtml(html);
  const turndown = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    emDelimiter: '*'
  });
  const md = turndown.turndown(clean);
  return normalizeMarkdown(md);
}

export function markdownToHtml(md: string): string {
  // marked.parse can return string | Promise<string>; we expect sync here with simple input
  const res = marked.parse(md ?? '');
  if (typeof res === 'string') return res;
  // Fallback when marked returns Promise in future versions; caller can handle async if needed
  // For now, return empty string to avoid runtime await in Svelte component
  return '';
}
