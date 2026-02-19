<script lang="ts">
  import { onMount } from 'svelte';
  export let data: { address: string };
  let address = '';
  $: address = data?.address ?? '';
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
    statusMsg = 'Resolving address...';
    try {
      // 1. Resolve name to immutable address
      const pnrRes = await fetch(`/anttp-0/pnr/${address}`, {
        headers: { 'accept': 'application/json' }
      });
      if (!pnrRes.ok) {
        statusMsg = `Failed to resolve address (${pnrRes.status})`;
        return;
      }
      const pnrData = await pnrRes.json();
      const immutableAddress = pnrData.records?.[""]?.address;
      console.log('immutableAddress: ' + immutableAddress);
      if (!immutableAddress) {
        statusMsg = 'Could not find immutable address in PNR response';
        return;
      }

      // 2. Upload article
      statusMsg = 'Uploading article...';
      const fd = new FormData();
      const uploadPath = path || 'hello-world.md';
      const file = new File([content], uploadPath, { type: 'text/markdown' });
      fd.append('files', file, file.name);
      
      const uploadRes = await fetch(`/anttp-0/multipart/archive/${immutableAddress}`, {
        method: 'PUT',
        headers: { 
          'accept': 'application/json',
          'x-store-type': 'disk'
        },
        body: fd
      });
      
      if (!uploadRes.ok) {
        statusMsg = `Upload failed (${uploadRes.status})`;
        return;
      }
      const uploadData = await uploadRes.json();
      const updatedImmutableAddress = uploadData.address;
      console.log('updatedImmutableAddress2: ' + updatedImmutableAddress);
      if (!updatedImmutableAddress) {
        statusMsg = 'Could not find updated immutable address in upload response';
        return;
      }

      // 3. Update PNR pointer
      statusMsg = 'Updating pointer...';
      const updatedPnrData = { ...pnrData };
      console.log('updatedPnrData1: ' + JSON.stringify(updatedPnrData));
      if (updatedPnrData.records?.[""]) {
        console.log('updatedPnrData.records[""]: ' + updatedPnrData.records[""].address);
        updatedPnrData.records[""].address = updatedImmutableAddress;
      }
      console.log('updatedPnrData2: ' + JSON.stringify(updatedPnrData));

      const updatePnrRes = await fetch(`/anttp-0/pnr/${address}`, {
        method: 'PUT',
        headers: { 
          'accept': 'application/json',
          'x-store-type': 'disk',
          'content-type': 'application/json'
        },
        body: JSON.stringify(updatedPnrData)
      });

      if (!updatePnrRes.ok) {
        statusMsg = `Failed to update pointer (${updatePnrRes.status})`;
      } else {
        statusMsg = 'Article created and pointer updated successfully';
      }
    } catch (err: any) {
      statusMsg = 'Error: ' + (err?.message || String(err));
    }
  }
</script>

<div class="space-y-4">
  <h1 class="text-2xl font-semibold">Create Article</h1>
  <form class="space-y-3" on:submit|preventDefault={submit}>
    <div>
      <label class="block text-sm" for="path">Path</label>
      <input id="path" class="border p-2 w-full" bind:value={path} placeholder="hello-world.md" required />
    </div>
    <div>
      <label class="block text-sm" for="content">Content</label>
      <textarea id="content" class="border p-2 w-full h-64" bind:value={content} placeholder={exampleContent} required></textarea>
    </div>
    <button class="bg-sky-600 text-white px-4 py-2 rounded" type="submit">Publish</button>
  </form>
  {#if statusMsg}
    <p class="text-sm">{statusMsg}</p>
  {/if}
</div>
