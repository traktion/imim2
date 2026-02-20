<script lang="ts">
  import ArticlePreview from '$lib/ArticlePreview.svelte';
  export let data: { address: string; listing: any[]; error?: string };
</script>

<svelte:head>
  <title>{data.address} - Home - IMIM 2.0</title>
</svelte:head>

<div class="space-y-4">
  {#if data.error}
    <p class="text-red-600">{data.error}</p>
  {:else if data.listing?.length}
    <div class="space-y-4">
      {#each data.listing as item}
        {#if item.type === 'FILE' && item.name.endsWith('.md')}
          <ArticlePreview address={data.address} {item} />
        {/if}
      {/each}
    </div>
  {:else}
    <p>No items found.</p>
  {/if}
</div>
