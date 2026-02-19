<script lang="ts">
  import { page } from '$app/stores';
  export let address: string;

  $: currentPath = $page.url.pathname;
  
  // Home: /[address]
  // Article: /[address]/[path] (usually active when viewing a specific article)
  // Publish: /[address]/create

  $: isHome = currentPath === `/${address}` || currentPath === `/${address}/`;
  $: isPublish = currentPath === `/${address}/create`;
  $: isArticle = !isHome && !isPublish && currentPath.startsWith(`/${address}/`);

  const baseClass = "px-4 py-2 transition-colors";
  const activeClass = "bg-sky-800 text-white";
  const inactiveClass = "text-sky-100 hover:bg-sky-700";
</script>

<nav class="w-full bg-sky-600 text-white mb-6">
  <div class="flex items-center">
    <a href="/{address}" class="{baseClass} {isHome ? activeClass : inactiveClass}">
      Home
    </a>
    <a href={isArticle ? currentPath : `/${address}`} class="{baseClass} {isArticle ? activeClass : inactiveClass}">
      Article
    </a>
    <a href="/{address}/create" class="{baseClass} {isPublish ? activeClass : inactiveClass}">
      Publish
    </a>
  </div>
</nav>
