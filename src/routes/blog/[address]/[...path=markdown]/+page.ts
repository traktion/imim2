import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ params, fetch, data }) => {
  const { address, path } = params as { address: string; path: string };
  const url = `http://${address}/${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    return { address, path, markdown: `# Error ${res.status}`, error: `Failed to fetch article (${res.status})` };
  }
  const markdown = await res.text();
  return { address, path, markdown };
};
