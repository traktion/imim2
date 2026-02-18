<script lang="ts">
  import ArticlePreview from '$lib/ArticlePreview.svelte';
  export let data: { address: string; listing: any[]; error?: string };
</script>

<div class="min-h-screen bg-white text-sky-700 p-6">
  <h1 class="text-3xl font-bold mb-8">{data.address}</h1>
  {#if data.error}
    <p class="text-red-600">{data.error}</p>
  {:else if data.listing?.length}
    <div class="space-y-4">
      {#each data.listing as item}
        {#if item.type === 'FILE'}
          <ArticlePreview address={data.address} {item} />
        {/if}
      {/each}
    </div>
  {:else}
    <p>No items found.</p>
  {/if}
  <div class="mt-6">
    <a class="text-sm underline" href="/{data.address}/create">Create new article</a>
  </div>
</div>
