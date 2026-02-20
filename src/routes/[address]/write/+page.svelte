<script lang="ts">
  export let data: { address: string };
  const address = data?.address ?? '';
  $: pageTitle = `${address} - Write - IMIM 2.0`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="space-y-4">
  <h1 class="text-2xl font-semibold">Write</h1>
  <p class="text-sky-700">Draft your article content here. Publishing is available under the Publish tab.</p>
  <p class="text-sky-600 text-sm">Route: /{address}/write</p>
</div>
