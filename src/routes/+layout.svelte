<script lang="ts">
  import { page } from '$app/stores';
  import Navigation from '$lib/Navigation.svelte';
  import '../app.css';

  $: address = $page.params.address;
</script>

<div class="flex flex-col items-center min-h-screen bg-white">
  {#if address}
    <Navigation {address} />
  {/if}
  <main class="w-full min-w-[25em] max-w-[50em] px-6">
    <slot />
  </main>
</div>
