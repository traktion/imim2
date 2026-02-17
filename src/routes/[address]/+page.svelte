<script lang="ts">
  export let data: { address: string; listing: any[]; error?: string };
</script>

<div class="min-h-screen bg-white text-sky-700 p-6">
  <h1 class="text-2xl font-semibold mb-4">{data.address}</h1>
  {#if data.error}
    <p class="text-red-600">{data.error}</p>
  {:else if data.listing?.length}
    <ul class="list-disc pl-5 space-y-2">
      {#each data.listing as item}
        <li>
          {#if item.path}
            <a class="underline hover:no-underline" href="/{data.address}/{item.path}">
              {item.title ?? item.path}
            </a>
          {:else if typeof item === 'string'}
            <a class="underline hover:no-underline" href="/{data.address}/{item}">
              {item}
            </a>
          {/if}
        </li>
      {/each}
    </ul>
  {:else}
    <p>No items found.</p>
  {/if}
  <div class="mt-6">
    <a class="text-sm underline" href="/{data.address}/create">Create new article</a>
  </div>
</div>
