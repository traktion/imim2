<script lang="ts">
  import { page } from '$app/stores';
  import { activeAddress } from './stores';
  export let address: string | undefined = undefined;

  $: currentPath = $page.url.pathname;
  
  // Home: /[address]
  // Article: /[address]/[path] (usually active when viewing a specific article)
  // Publish: /[address]/create
  // About: /about

  $: effectiveAddress = address || $activeAddress;

  $: isHome = effectiveAddress ? (currentPath === `/${effectiveAddress}` || currentPath === `/${effectiveAddress}/`) : false;
  $: isPublish = effectiveAddress ? (currentPath === `/${effectiveAddress}/create`) : false;
  $: isArticle = effectiveAddress ? (!isHome && !isPublish && currentPath.startsWith(`/${effectiveAddress}/`)) : false;
  $: isAbout = (currentPath as string) === '/about' || (currentPath as string) === '/about/';

  const baseClass = "px-4 py-2 transition-colors";
  const activeClass = "bg-sky-800 text-white";
  const inactiveClass = "text-sky-100 hover:bg-sky-700";
</script>

<nav class="w-full bg-sky-600 text-white mb-6">
  <div class="flex items-center">
    {#if effectiveAddress}
      <a href="/{effectiveAddress}" class="{baseClass} {isHome ? activeClass : inactiveClass}">
        Home
      </a>
      <a href={isArticle ? currentPath : `/${effectiveAddress}`} class="{baseClass} {isArticle ? activeClass : inactiveClass}">
        Article
      </a>
      <a href="/{effectiveAddress}/create" class="{baseClass} {isPublish ? activeClass : inactiveClass}">
        Publish
      </a>
    {:else}
      <span class="{baseClass} text-sky-300 cursor-not-allowed">Home</span>
      <span class="{baseClass} text-sky-300 cursor-not-allowed">Article</span>
      <span class="{baseClass} text-sky-300 cursor-not-allowed">Publish</span>
    {/if}
    <a href="/about" class="{baseClass} {isAbout ? activeClass : inactiveClass}">
      About
    </a>
  </div>
</nav>
