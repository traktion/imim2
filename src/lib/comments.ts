export interface Comment {
  text: string;
  address: string;
}

export function getCommentKey(address: string, path: string, index: number): string {
  const blogName = address;
  const articleName = path.split('/').pop()?.replace(/\.[^/.]+$/, '') || '';
  return `imim_${blogName}_${articleName}_comment${index}`;
}

export async function getComments(
  address: string,
  path: string,
  fetchFn: typeof fetch = fetch
): Promise<Comment[]> {
  const comments: Comment[] = [];
  let index = 1;

  while (true) {
    const commentKey = getCommentKey(address, path, index);
    
    // 1. Get graph entry
    const graphRes = await fetchFn(`/anttp-0/graph_entry/${commentKey}`, {
      headers: { 
        'accept': 'application/json',
        'x-data-key': 'resolver'
      }
    });

    if (!graphRes.ok) {
      break; // No more comments
    }

    const graphData = await graphRes.json();
    const commentAddress = graphData.content;

    if (!commentAddress) {
      break;
    }

    // 2. Get public data
    const dataRes = await fetchFn(`/anttp-0/binary/public_data/${commentAddress}`);
    if (dataRes.ok) {
      const text = await dataRes.text();
      comments.push({ text, address: commentAddress });
    } else {
      // If we found a graph entry but failed to get data, we should probably stop or skip.
      // The requirement says "repeat until there are no matches", so we might skip if it's a transient error,
      // but usually if graph entry exists, data should too.
      break; 
    }

    index++;
    
    // Safety break to prevent infinite loops if something goes wrong
    if (index > 1000) break;
  }

  return comments;
}

export async function addComment(
  address: string,
  path: string,
  text: string,
  fetchFn: typeof fetch = fetch
): Promise<void> {
  // 1. POST public data
  const dataRes = await fetchFn('/anttp-0/binary/public_data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream'
    },
    body: text
  });

  if (!dataRes.ok) {
    throw new Error(`Failed to create public data for comment (${dataRes.status})`);
  }

  const dataResult = await dataRes.json();
  const commentAddress = dataResult.address;

  // 2. Find next comment index
  let index = 1;
  while (true) {
    const commentKey = getCommentKey(address, path, index);
    const graphRes = await fetchFn(`/anttp-0/graph_entry/${commentKey}`, {
      headers: { 
        'accept': 'application/json',
        'x-data-key': 'resolver'
      }
    });
    if (!graphRes.ok) {
      break;
    }
    index++;
    if (index > 1000) throw new Error("Too many comments or loop detected");
  }

  const commentKey = getCommentKey(address, path, index);

  // 3. POST graph entry
  const graphRes = await fetchFn('/anttp-0/graph_entry', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-data-key': 'resolver'
    },
    body: JSON.stringify({
      content: commentAddress,
      name: commentKey
    })
  });

  if (!graphRes.ok) {
    throw new Error(`Failed to create graph entry for comment (${graphRes.status})`);
  }
}
