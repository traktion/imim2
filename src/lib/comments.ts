import { marked } from 'marked';

export interface Comment {
  text: string;
  address: string;
  loading?: boolean;
}

// Simple list of blocked words
// More variations can be added here
const BLOCKED_WORDS = ['badword1', 'badword2', 'shit', 'fuck', 'damn', 'hell'];

export function sanitiseComment(text: string): string {
  if (!text) return '';

  // 1. Strip control characters
  let sanitised = text.replace(/[\x00-\x1F\x7F]/g, '');

  // 2. Only include alphanumeric characters and basic punctuation
  // Allowed: a-z, A-Z, 0-9, space, and . , ! ? ( ) ' \" - [ ] * _ : /
  // We added [ ] * _ : / to support basic markdown and protocol parts after sanitisation
  sanitised = sanitised.replace(/[^a-zA-Z0-9\s.,!?'"()\-_\[\]*:/]/g, '');

  // 3. Strip URLs
  sanitised = sanitised.replace(/https?:\/\/[^\s]+/gi, '[URL REMOVED]');

  // 4. Strip swear words
  BLOCKED_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    sanitised = sanitised.replace(regex, '****');
  });

  return sanitised;
}

export function renderComment(text: string): string {
  const sanitised = sanitiseComment(text);
  
  // Assume it is markdown first
  try {
    // marked.parse returns a string (HTML)
    // We cast to string because older versions of marked might return a Promise if async is true,
    // but here we use it synchronously.
    const html = marked.parse(sanitised) as string;
    return html;
  } catch (e) {
    // If markdown conversion fails, treat as plain text
    return `<p>${sanitised}</p>`;
  }
}

export function getCommentKey(address: string, path: string, index: number): string {
  const blogName = address;
  const articleName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  return `imim_${blogName}_${articleName}_comment${index}`;
}

export async function publishComment(
  address: string,
  path: string,
  commentText: string,
  currentIndex: number,
  fetchFn: typeof fetch = fetch
): Promise<{ success: boolean; error?: string }> {
  try {
    const commentKey = getCommentKey(address, path, currentIndex + 1);
    const res = await fetchFn(`/anttp-0/binary/key_value/${commentKey}/msg1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: commentText
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => 'No error body');
      return { success: false, error: `Failed to create comment: ${res.status} ${errorText}` };
    }

    return { success: true };
  } catch (e) {
    console.error('Error publishing comment:', e);
    return { success: false, error: (e as Error).message };
  }
}

export async function getComments(
  address: string,
  path: string,
  onComment: (comment: Comment) => void,
  fetchFn: typeof fetch = fetch
): Promise<void> {
  let index = 1;
  const BATCH_SIZE = 2;

  while (true) {
    const batchIndices = Array.from({ length: BATCH_SIZE }, (_, i) => index + i);
    let foundInBatch = false;

    // Fetch batch of key_value entries in parallel
    const kvPromises = batchIndices.map(async (idx) => {
      const commentKey = getCommentKey(address, path, idx);
      const res = await fetchFn(`/anttp-0/binary/key_value/${commentKey}/msg1`, {
        headers: { 
          'accept': 'application/octet-stream'
        }
      });
      if (res.ok) {
        const text = await res.text();
        return { index: idx, text, found: true };
      }
      return { index: idx, text: '', found: false };
    });

    const kvResults = await Promise.all(kvPromises);
    
    // Sort by index to maintain order
    kvResults.sort((a, b) => a.index - b.index);

    for (const result of kvResults) {
      if (result.found) {
        foundInBatch = true;
        // Directly notify the comment text
        const commentKey = getCommentKey(address, path, result.index);
        const comment: Comment = { text: result.text, address: commentKey, loading: false };
        onComment(comment);
      } else {
        // If we hit a gap, we assume no more comments
        return; 
      }
    }

    if (!foundInBatch) break;
    index += BATCH_SIZE;
    if (index > 1000) break;
  }
}