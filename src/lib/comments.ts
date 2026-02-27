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
    // 1. Create public data
    const publicDataRes = await fetchFn('/anttp-0/binary/public_data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: commentText
    });

    if (!publicDataRes.ok) {
      const errorText = await publicDataRes.text().catch(() => 'No error body');
      return { success: false, error: `Failed to create public data: ${publicDataRes.status} ${errorText}` };
    }

    const publicData = await publicDataRes.json();
    const contentAddress = publicData.address;

    // 2. Create graph entry
    const commentKey = getCommentKey(address, path, currentIndex + 1);
    const graphEntryRes = await fetchFn('/anttp-0/graph_entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: contentAddress,
        name: commentKey,
        data_key: 'resolver'
      })
    });

    if (!graphEntryRes.ok) {
      const errorText = await graphEntryRes.text().catch(() => 'No error body');
      return { success: false, error: `Failed to create graph entry: ${graphEntryRes.status} ${errorText}` };
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

    // Fetch batch of graph entries in parallel
    const graphPromises = batchIndices.map(async (idx) => {
      const commentKey = getCommentKey(address, path, idx);
      const res = await fetchFn(`/anttp-0/graph_entry/${commentKey}`, {
        headers: { 
          'accept': 'application/json',
          'x-data-key': 'resolver'
        }
      });
      if (res.ok) {
        const data = await res.json();
        return { index: idx, address: data.content };
      }
      return { index: idx, address: null };
    });

    const graphResults = await Promise.all(graphPromises);
    
    // Sort by index to maintain order
    graphResults.sort((a, b) => a.index - b.index);

    for (const result of graphResults) {
      if (result.address) {
        foundInBatch = true;
        // Create a placeholder comment in loading state
        const comment: Comment = { text: '', address: result.address, loading: true };
        onComment(comment);

        // Fetch the data asynchronously without awaiting it here
        fetchFn(`/anttp-0/binary/public_data/${result.address}`).then(async (dataRes) => {
          if (dataRes.ok) {
            comment.text = await dataRes.text();
          } else {
            // Requirement says "hide comment text elements which return no data"
            comment.text = '';
          }
          comment.loading = false;
          onComment(comment); // Notify update
        }).catch(() => {
          comment.loading = false;
          comment.text = '';
          onComment(comment);
        });
      } else {
        // If we hit a gap, we assume no more comments? 
        // Sequential requirement from previous issue: "repeat until there are no matches"
        // So first null means end.
        return; 
      }
    }

    if (!foundInBatch) break;
    index += BATCH_SIZE;
    if (index > 1000) break;
  }
}