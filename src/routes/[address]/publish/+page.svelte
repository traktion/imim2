<script lang="ts">
  export let data: { address: string };
  const address = data?.address ?? '';
  $: pageTitle = `${address} - Publish - IMIM 2.0`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="space-y-4">
  <h1 class="text-2xl font-semibold">Publish</h1>
  <p class="text-sky-700">Once you have finished writing your article, you can publish it to the network from this page.</p>
  <p class="text-sky-600 text-sm">Note: This is a placeholder for the future publishing workflow.</p>
</div>
