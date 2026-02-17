<script lang="ts">
  import type { PageData } from './$types';
  import { marked } from 'marked';
  export let data: PageData & { error?: string };
  $: html = marked.parse(data.markdown ?? '');
</script>

<div class="min-h-screen bg-white text-sky-700 p-6 prose max-w-none">
  {#if data.error}
    <p class="text-red-600">{data.error}</p>
  {/if}
  {@html html}
</div>
