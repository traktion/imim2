<script lang="ts">
  import { onMount } from 'svelte';
  import { marked } from 'marked';
  import { rewriteUrls } from './utils';

  export let address: string;
  export let item: { name: string; type: string };

  let content = '';
  let loading = true;
  let error = '';
  let isMarkdown = item.name.endsWith('.md');

  onMount(async () => {
    try {
      const url = `http://${address}/${item.name}`;
      const res = await fetch(url);
      if (!res.ok) {
        error = `Failed to load (${res.status})`;
      } else {
        content = await res.text();
      }
    } catch (e) {
      error = 'Error loading content';
    } finally {
      loading = false;
    }
  });

  $: html = isMarkdown ? rewriteUrls(marked.parse(content), address, item.name) : '';
  
  // Extract title from markdown if available
  $: title = isMarkdown ? (content.match(/^#\s+(.+)$/m)?.[1] || item.name) : item.name;
</script>

<div class="py-8 first:pt-0 border-b border-sky-100 last:border-b-0">
  <h2 class="text-2xl font-bold mb-4">
    <a href="/{address}/{item.name}" class="hover:underline text-sky-800">
      {title}
    </a>
  </h2>
  
  <div class="max-h-[75vh] overflow-hidden relative mb-4">
    {#if loading}
      <div class="flex items-center justify-center h-32">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-700"></div>
      </div>
    {:else if error}
      <p class="text-red-600">{error}</p>
    {:else}
      <div class="prose max-w-none text-sky-900">
        {#if isMarkdown}
          <div class="media-container">
            {@html html}
          </div>
        {:else}
          <pre class="whitespace-pre-wrap">{content}</pre>
        {/if}
      </div>
      <div class="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
    {/if}
  </div>
  
  <a href="/{address}/{item.name}" class="inline-block bg-sky-700 text-white px-4 py-2 rounded hover:bg-sky-800 transition-colors">
    Read Full Article
  </a>
</div>
