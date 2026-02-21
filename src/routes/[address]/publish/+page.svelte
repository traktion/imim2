<script lang="ts">
  export let data: { address: string };
  const address = data?.address ?? '';
  $: pageTitle = `${address} - Publish - IMIM 2.0`;

  let statusMsg = '';
  let isLoading = false;

  async function publish() {
    isLoading = true;
    statusMsg = 'Starting publication to network...';

    try {
      // 1. GET PNR
      statusMsg = 'Retrieving latest PNR...';
      const pnrGetRes = await fetch(`/anttp-0/pnr/${address}`, {
        headers: { 'accept': 'application/json' }
      });
      if (!pnrGetRes.ok) {
        throw new Error(`Failed to get PNR (${pnrGetRes.status})`);
      }
      const pnrData = await pnrGetRes.json();
      const immutableAddress = pnrData.records?.[""]?.address;

      if (!immutableAddress) {
        throw new Error('Could not find immutable address in PNR record');
      }

      // 2. PUT PNR (network)
      statusMsg = 'Persisting PNR to network...';
      const pnrPutRes = await fetch(`/anttp-0/pnr/${address}`, {
        method: 'PUT',
        headers: {
          'accept': 'application/json',
          'x-store-type': 'network',
          'content-type': 'application/json'
        },
        body: JSON.stringify(pnrData)
      });
      if (!pnrPutRes.ok) {
        throw new Error(`Failed to persist PNR to network (${pnrPutRes.status})`);
      }

      // 3. POST Archive (network)
      statusMsg = 'Persisting archive to network...';
      const archivePostRes = await fetch(`/anttp-0/archive/${immutableAddress}`, {
        method: 'POST',
        headers: {
          'x-store-type': 'network'
        }
      });
      if (!archivePostRes.ok) {
        throw new Error(`Failed to persist archive to network (${archivePostRes.status})`);
      }

      statusMsg = 'Publishing successful! Your blog will soon be on the Autonomi network.';
    } catch (err: any) {
      statusMsg = `Error: ${err.message || String(err)}`;
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>{pageTitle}</title>
</svelte:head>

<div class="space-y-4">
  <h1 class="text-2xl font-semibold">Publish</h1>
  <p class="text-sky-700">Once you have finished writing your article, you can publish it to the network from this page.</p>
  
  <div class="bg-sky-50 p-4 rounded border border-sky-200">
    <h2 class="font-medium text-sky-900 mb-2">Publish to Autonomi</h2>
    <p class="text-sm text-sky-800 mb-4">
      This will persist your current blog state (PNR and Archive) to the Autonomi network, making it accessible to everyone.
    </p>
    <button 
      class="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50"
      on:click={publish}
      disabled={isLoading}
    >
      {isLoading ? 'Publishing...' : 'Publish to Autonomi'}
    </button>
  </div>

  {#if statusMsg}
    <div class="p-3 rounded text-sm {statusMsg.startsWith('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}">
      {statusMsg}
    </div>
  {/if}
</div>
