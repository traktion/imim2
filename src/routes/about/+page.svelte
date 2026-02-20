<script lang="ts">
  const links = [
    { href: 'https://github.com/traktion/imim2', label: 'Code repository' },
    { href: 'https://www.linkedin.com/in/paul-s-green/', label: "Developer's bio" },
    { href: 'https://autonomi.com/', label: 'Autonomi' }
  ];
</script>

<svelte:head>
  <title>About - IMIM 2.0</title>
</svelte:head>

<div class="prose max-w-none text-sky-900 space-y-4">
  <h1>About</h1>
  <p>
    IMIM 2.0 is a SvelteKit front-end for browsing and publishing markdown content
    to Autonomi via the AntTP protocol. It expects a local AntTP instance to be
    available and configured as a proxy in your browser for network access.
  </p>
  <ul>
    {#each links as l}
      <li><a class="text-sky-700 underline" href={l.href} rel="noopener" target="_blank">{l.label}</a></li>
    {/each}
  </ul>
</div>
