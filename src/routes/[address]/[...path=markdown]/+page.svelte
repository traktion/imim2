<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { marked } from 'marked';
  import { rewriteUrls } from '$lib/utils';
  import { getComments, type Comment, renderComment, publishComment } from '$lib/comments';

  export let data: PageData & { error?: string };
  $: isMarkdown = data.path.endsWith('.md');
  $: html = isMarkdown ? rewriteUrls(marked.parse(data.markdown ?? ''), data.address, data.path) : '';

  let comments: Comment[] = [];
  let commentsLoading = true;

  let isWritingComment = false;
  let newCommentText = '';
  let isPublishing = false;
  let publishError = '';

  onMount(() => {
    loadComments();
  });

  function loadComments() {
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
  }

  async function handlePublish() {
    if (!newCommentText.trim()) return;
    
    isPublishing = true;
    publishError = '';
    
    const result = await publishComment(data.address, data.path, newCommentText, comments.length);
    
    if (result.success) {
      // Clear state and hide editor
      const tempComment = newCommentText;
      newCommentText = '';
      isWritingComment = false;
      isPublishing = false;
      
      // We don't have the address of the newly created comment immediately here (publishComment doesn't return it)
      // but we can just reload comments or add a optimistic one if we wanted.
      // The requirement says: "if it was successful, then render the comment in the correct location in the list of comments"
      // Since getComments polls/fetches sequentially, we can just trigger it again or 
      // since it's already running it might not pick it up if it already hit a null.
      // Let's just reset and reload for simplicity and to ensure "correct location".
      comments = [];
      commentsLoading = true;
      loadComments();
    } else {
      publishError = result.error || 'Failed to publish comment';
      isPublishing = false;
    }
  }

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
              <div class="border-l-4 border-sky-200 pl-4 py-1 italic text-sky-800 flex items-center gap-2">
                {#if comment.loading}
                  <svg class="animate-spin h-4 w-4 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span class="text-sky-400">Loading comment...</span>
                {:else}
                  <div class="prose prose-sm text-sky-800 max-w-none">
                    {@html renderComment(comment.text)}
                  </div>
                {/if}
              </div>
            {/if}
          {:else}
            {#if !commentsLoading}
              <p class="text-sky-600 italic">No comments yet.</p>
            {/if}
          {/each}
        </div>
        
        <div class="mt-8 pt-4">
          {#if !isWritingComment}
            <a href="#" class="text-sky-600 hover:underline text-sm font-medium" on:click|preventDefault={() => isWritingComment = true}>Write a comment</a>
          {:else}
            <div class="space-y-4 max-w-2xl">
              <h3 class="text-lg font-medium text-sky-900">Write a comment</h3>
              {#if publishError}
                <p class="text-red-600 text-sm">{publishError}</p>
              {/if}
              <textarea
                class="w-full h-32 p-3 border border-sky-200 rounded-md focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sky-900 bg-white/50 disabled:bg-gray-100 disabled:text-gray-400"
                placeholder="Share your thoughts (markdown supported)..."
                bind:value={newCommentText}
                disabled={isPublishing}
              ></textarea>
              <div class="flex items-center gap-4">
                <button
                  class="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 font-medium disabled:bg-sky-300 disabled:cursor-not-allowed flex items-center gap-2"
                  on:click={handlePublish}
                  disabled={isPublishing || !newCommentText.trim()}
                >
                  {#if isPublishing}
                    <svg class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  {:else}
                    Publish
                  {/if}
                </button>
                <button
                  class="px-4 py-2 text-sky-600 hover:bg-sky-50 rounded-md font-medium disabled:text-gray-400"
                  on:click={() => { isWritingComment = false; publishError = ''; }}
                  disabled={isPublishing}
                >
                  Cancel
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  {:else}
    <pre class="whitespace-pre-wrap">{data.markdown}</pre>
  {/if}
</div>
