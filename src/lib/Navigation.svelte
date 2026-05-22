<script lang="ts">
  import { page } from '$app/stores';
  import { activeAddress } from './stores';
  export let address: string | undefined = undefined;

  $: currentPath = $page.url.pathname;
  
  // Browse: /[address]
  // Read: /[address]/[path] (usually active when viewing a specific article)
  // Write: /[address]/write
  // Publish: /[address]/publish
  // About: /about

  $: effectiveAddress = address || $activeAddress;

  $: isHome = currentPath === '/';
  $: isBrowse = effectiveAddress ? (currentPath === `/blog/${effectiveAddress}` || currentPath === `/blog/${effectiveAddress}/`) : false;
  $: isWrite = effectiveAddress ? (currentPath === `/blog/${effectiveAddress}/write`) : false;
  $: isPublish = effectiveAddress ? (currentPath === `/blog/${effectiveAddress}/publish`) : false;
  $: isRead = effectiveAddress ? (!isBrowse && !isWrite && !isPublish && currentPath.startsWith(`/blog/${effectiveAddress}/`)) : false;
  $: isAbout = (currentPath as string) === '/about' || (currentPath as string) === '/about/';

  const baseClass = "px-4 py-2 transition-colors";
  const activeClass = "bg-sky-800 text-white";
  const inactiveClass = "text-sky-100 hover:bg-sky-700";
</script>

<nav class="w-full bg-sky-600 text-white mb-6">
  <div class="flex items-center">
    <a href="/" class="{baseClass} {isHome ? activeClass : inactiveClass}">
      Home
    </a>
    {#if effectiveAddress}
      <a href="/blog/{effectiveAddress}" class="{baseClass} {isBrowse ? activeClass : inactiveClass}">
        Browse
      </a>
      <a href={isRead ? currentPath : `/blog/${effectiveAddress}`} class="{baseClass} {isRead ? activeClass : inactiveClass}">
        Read
      </a>
      <a href="/blog/{effectiveAddress}/write" class="{baseClass} {isWrite ? activeClass : inactiveClass}">
        Write
      </a>
      <a href="/blog/{effectiveAddress}/publish" class="{baseClass} {isPublish ? activeClass : inactiveClass}">
        Publish
      </a>
    {:else}
      <span class="{baseClass} text-sky-300 cursor-not-allowed">Browse</span>
      <span class="{baseClass} text-sky-300 cursor-not-allowed">Read</span>
      <span class="{baseClass} text-sky-300 cursor-not-allowed">Write</span>
      <span class="{baseClass} text-sky-300 cursor-not-allowed">Publish</span>
    {/if}
    <a href="/about" class="{baseClass} {isAbout ? activeClass : inactiveClass}">
      About
    </a>
  </div>
</nav>
