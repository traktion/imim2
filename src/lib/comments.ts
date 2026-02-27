export interface Comment {
  text: string;
  address: string;
  loading?: boolean;
}

export function getCommentKey(address: string, path: string, index: number): string {
  const blogName = address;
  const articleName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  return `imim_${blogName}_${articleName}_comment${index}`;
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