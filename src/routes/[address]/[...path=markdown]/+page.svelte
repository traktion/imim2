<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { marked } from 'marked';
  import { rewriteUrls } from '$lib/utils';
  import { getComments, type Comment } from '$lib/comments';

  export let data: PageData & { error?: string };
  $: isMarkdown = data.path.endsWith('.md');
  $: html = isMarkdown ? rewriteUrls(marked.parse(data.markdown ?? ''), data.address, data.path) : '';

  let comments: Comment[] = [];
  let commentsLoading = true;

  onMount(() => {
    try {
      getComments(data.address, data.path, (comment) => {
        // Find if this comment already exists (by address)
        const existingIdx = comments.findIndex(c => c.address === comment.address);
        if (existingIdx !== -1) {
          comments[existingIdx] = { ...comment };
        } else {
          comments = [...comments, comment];
        }
        commentsLoading = false;
      });
    } catch (e) {
      console.error('Failed to load comments', e);
      commentsLoading = false;
    }
  });

  function startCase(str: string) {
    return str
      .replace(/[-_]+/g, ' ')
      .replace(/\.[^/.]+$/, '')
      .replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1));
  }
  $: fileTitle = startCase(data.path.split('/').pop() ?? 'Article');
</script>

<svelte:head>
  <title>{fileTitle} - {data.address} - Read - IMIM 2.0</title>
</svelte:head>

<div class="prose max-w-none text-sky-900">
  {#if data.error}
    <p class="text-red-600">{data.error}</p>
  {/if}
  
  {#if isMarkdown}
    <div class="media-container">
      {@html html}
    </div>

    <div class="mt-12 pt-8 border-t border-sky-100">
      <h2 class="text-xl font-semibold mb-4">Comments</h2>
      {#if commentsLoading && comments.length === 0}
        <p class="text-sky-600 italic">Loading comments...</p>
      {:else}
        <div class="space-y-4">
          {#each comments as comment}
            {#if comment.loading || comment.text}
              <blockquote class="border-l-4 border-sky-200 pl-4 py-1 italic text-sky-800 flex items-center gap-2">
                {#if comment.loading}
                  <svg class="animate-spin h-4 w-4 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-sky-400">Loading comment...</span>
                {:else}
                  {comment.text}
                {/if}
              </blockquote>
            {/if}
          {:else}
            {#if !commentsLoading}
              <p class="text-sky-600 italic">No comments yet.</p>
            {/if}
          {/each}
        </div>
        <div class="mt-6">
          <a href="#" class="text-sky-600 hover:underline text-sm font-medium">Write a comment</a>
        </div>
      {/if}
    </div>
  {:else}
    <pre class="whitespace-pre-wrap">{data.markdown}</pre>
  {/if}
</div>
