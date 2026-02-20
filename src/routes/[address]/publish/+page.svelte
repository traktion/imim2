<script lang="ts">
  import CreatePage from '../create/+page.svelte';
  export let data: { address: string };
  const address = data?.address ?? '';
  $: pageTitle = `${address} - Publish - IMIM 2.0`;
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<CreatePage {data} />
