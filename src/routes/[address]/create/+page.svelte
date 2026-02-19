<script lang="ts">
  export let data: { address: string };
  let address = data?.address ?? '';
  let path = '';
  let content = '';
  let statusMsg = '';

  const exampleContent = `# Main Title

## Sub Title

Regular body text

Emphasis: *italic* / **bold** / ~~strike~~ / \`inline code\`

Links: [text](http://traktion/clean-green-immutable-dream.md) /  / [ref][id]
[id]: http://traktion/ "title"

Images: ![alt](http://traktion/markdown-article.png)`;

  async function submit(e: Event) {
    e.preventDefault();
    statusMsg = 'Resolving blog name...';
    try {
      // 1. Resolve name to immutable address
      const pointerRes = await fetch(`/anttp-0/pointer/${address}`);
      if (!pointerRes.ok) {
        throw new Error(`Failed to resolve blog name (${pointerRes.status})`);
      }
      const pointerData = await pointerRes.json();
      const immutableAddress = pointerData.content;
      if (!immutableAddress) {
        throw new Error('Could not find immutable address for this blog');
      }

      statusMsg = 'Uploading article...';
      // 2. Upload article using immutable address
      const fd = new FormData();
      const file = new File([content], path || 'article.md', { type: 'text/markdown' });
      fd.append('file', file, file.name);
      
      const uploadRes = await fetch(`/anttp-0/multipart/archive/${immutableAddress}/${encodeURIComponent(path)}`, {
        method: 'PUT',
        headers: {
          'x-store-type': 'disk'
        },
        body: fd
      });

      if (!uploadRes.ok) {
        throw new Error(`Upload failed (${uploadRes.status})`);
      }

      const uploadData = await uploadRes.json();
      const updatedImmutableAddress = uploadData.address;

      statusMsg = 'Updating blog pointer...';
      // 3. Update pointer to the new immutable address
      const updatePointerRes = await fetch(`/anttp-0/pointer/${address}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-store-type': 'disk'
        },
        body: JSON.stringify({
          content: updatedImmutableAddress,
          name: address
        })
      });

      if (!updatePointerRes.ok) {
        throw new Error(`Failed to update blog pointer (${updatePointerRes.status})`);
      }

      statusMsg = 'Publish successful';
    } catch (err: any) {
      statusMsg = 'Error: ' + (err?.message || String(err));
    }
  }
</script>

<div class="space-y-4">
  <h1 class="text-2xl font-semibold">Create Article</h1>
  <form class="space-y-3" on:submit|preventDefault={submit}>
    <div>
      <label class="block text-sm font-medium" for="path">Path</label>
      <input id="path" class="border p-2 w-full rounded" bind:value={path} placeholder="hello-world.md" required />
    </div>
    <div>
      <label class="block text-sm font-medium" for="content">Content</label>
      <textarea id="content" class="border p-2 w-full h-96 rounded font-mono text-sm" bind:value={content} placeholder={exampleContent} required></textarea>
    </div>
    <div class="flex items-center space-x-4">
      <button class="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded font-medium transition-colors" type="submit">Publish</button>
      {#if statusMsg}
        <p class="text-sm {statusMsg.startsWith('Error') ? 'text-red-600' : 'text-slate-600'} font-medium">{statusMsg}</p>
      {/if}
    </div>
  </form>
</div>
