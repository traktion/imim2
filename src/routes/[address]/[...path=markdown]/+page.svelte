<script lang="ts">
  import type { PageData } from './$types';
  import { marked } from 'marked';
  import { rewriteUrls } from '$lib/utils';
  export let data: PageData & { error?: string };
  $: isMarkdown = data.path.endsWith('.md');
  $: html = isMarkdown ? rewriteUrls(marked.parse(data.markdown ?? ''), data.address, data.path) : '';
</script>

<div class="prose max-w-none text-sky-900">
  {#if data.error}
    <p class="text-red-600">{data.error}</p>
  {/if}
  
  {#if isMarkdown}
    <div class="media-container">
      {@html html}
    </div>
  {:else}
    <pre class="whitespace-pre-wrap">{data.markdown}</pre>
  {/if}
</div>
