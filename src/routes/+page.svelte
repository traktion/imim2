<script lang="ts">
  import { goto } from '$app/navigation';
  let address = '';

  function handleSubmit() {
    if (address.trim()) {
      goto(`/blog/${address.trim()}`);
    }
  }
</script>

<svelte:head>
  <title>Home - IMIM 2.0</title>
</svelte:head>

<div class="space-y-6 py-8">
  <div class="text-center">
    <h1 class="text-3xl font-bold text-sky-900">Welcome to IMIM 2.0</h1>
    <p class="text-sky-700 mt-2">Browse and publish markdown content to Autonomi.</p>
  </div>

  <form on:submit|preventDefault={handleSubmit} class="max-w-md mx-auto space-y-4 bg-sky-50 p-6 rounded-lg shadow-sm border border-sky-100">
    <div>
      <label for="address" class="block text-sm font-medium text-sky-900 mb-1">Enter AntTP Address</label>
      <input
        type="text"
        id="address"
        bind:value={address}
        placeholder="e.g. traktion"
        class="w-full px-4 py-2 border border-sky-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all"
        required
      />
    </div>
    <button
      type="submit"
      class="w-full bg-sky-600 text-white py-2 px-4 rounded-md hover:bg-sky-700 transition-colors font-medium"
    >
      Go to Blog
    </button>
  </form>

  <div class="max-w-md mx-auto text-sm text-sky-600 text-center">
    <p>
      Need help? Check the <a href="/about" class="underline hover:text-sky-800">About</a> page for more information.
    </p>
  </div>
</div>
