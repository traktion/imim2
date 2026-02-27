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

  onMount(async () => {
    try {
      comments = await getComments(data.address, data.path);
    } catch (e) {
      console.error('Failed to load comments', e);
    } finally {
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
      {#if commentsLoading}
        <p class="text-sky-600 italic">Loading comments...</p>
      {:else}
        <div class="space-y-4">
          {#each comments as comment}
            <blockquote class="border-l-4 border-sky-200 pl-4 py-1 italic text-sky-800">
              {comment.text}
            </blockquote>
          {:else}
            <p class="text-sky-600 italic">No comments yet.</p>
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
