<script lang="ts">
  import { onMount } from 'svelte';
  export let data: { address: string };
  let address = data?.address ?? '';
  let path = '';
  let content = '';
  let statusMsg = '';

  async function submit(e: Event) {
    e.preventDefault();
    statusMsg = 'Uploading...';
    try {
      const fd = new FormData();
      const file = new File([content], path || 'article.md', { type: 'text/markdown' });
      fd.append('file', file, file.name);
      const res = await fetch(`/anttp-0/multipart/archive/${address}/${encodeURIComponent(path)}`, {
        method: 'PUT',
        body: fd
      });
      if (!res.ok) {
        statusMsg = `Upload failed (${res.status})`;
      } else {
        statusMsg = 'Upload successful';
      }
    } catch (err: any) {
      statusMsg = 'Error: ' + (err?.message || String(err));
    }
  }
</script>

<div class="min-h-screen bg-white text-sky-700 p-6 space-y-4">
  <h1 class="text-2xl font-semibold">Create Article</h1>
  <form class="space-y-3" on:submit|preventDefault={submit}>
    <div>
      <label class="block text-sm" for="address">Address</label>
      <input id="address" class="border p-2 w-full" bind:value={address} placeholder="traktion" required />
    </div>
    <div>
      <label class="block text-sm" for="path">Path</label>
      <input id="path" class="border p-2 w-full" bind:value={path} placeholder="posts/hello.md" required />
    </div>
    <div>
      <label class="block text-sm" for="markdown">Markdown</label>
      <textarea id="markdown" class="border p-2 w-full h-64" bind:value={content} placeholder="# Hello\nBody..." required></textarea>
    </div>
    <button class="bg-sky-600 text-white px-4 py-2 rounded" type="submit">Publish</button>
  </form>
  {#if statusMsg}
    <p class="text-sm">{statusMsg}</p>
  {/if}
</div>
