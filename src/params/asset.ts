import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  // Match any file that DOES NOT end with .md
  // This allows /[address]/path/image.png to be matched by this route
  // while /[address]/path/article.md will NOT be matched and fall through to +page.svelte
  return !param.endsWith('.md');
};
