<script lang="ts">
  export let wysiwygEl: HTMLDivElement | null;

  function format(command: string, value: string | undefined = undefined) {
    if (!wysiwygEl) return;
    wysiwygEl.focus();
    document.execCommand(command, false, value);
    // Trigger input event to sync state if necessary, 
    // though Svelte's bind:this doesn't automatically sync innerHTML changes from execCommand
    wysiwygEl.dispatchEvent(new Event('input', { bubbles: true }));
  }

  const buttons = [
    { label: 'B', title: 'Bold', command: 'bold', class: 'font-bold' },
    { label: 'I', title: 'Italic', command: 'italic', class: 'italic' },
    { label: 'U', title: 'Underline', command: 'underline', class: 'underline' },
    { label: 'H1', title: 'Heading 1', command: 'formatBlock', value: '<h1>' },
    { label: 'H2', title: 'Heading 2', command: 'formatBlock', value: '<h2>' },
    { label: 'UL', title: 'Unordered List', command: 'insertUnorderedList' },
    { label: 'OL', title: 'Ordered List', command: 'insertOrderedList' },
    { label: 'Link', title: 'Insert Link', command: 'createLink' }
  ];

  function handleCommand(btn: typeof buttons[0]) {
    let value = btn.value;
    if (btn.command === 'createLink') {
      const url = prompt('Enter the URL');
      if (url) {
        value = url;
      } else {
        return;
      }
    }
    format(btn.command, value);
  }
</script>

<div class="flex flex-wrap gap-1 p-1 bg-gray-50 border-b">
  {#each buttons as btn}
    <button
      type="button"
      on:click={() => handleCommand(btn)}
      title={btn.title}
      class="px-3 py-1 border rounded bg-white hover:bg-gray-100 text-sm {btn.class || ''}"
    >
      {btn.label}
    </button>
  {/each}
</div>
