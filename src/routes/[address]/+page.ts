import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  const address = params.address;
  const url = `http://${address}/index.json`;
  const res = await fetch(url);
  if (!res.ok) {
    return { address, listing: [], error: `Failed to fetch listing (${res.status})` };
  }
  let listing: any = [];
  try {
    listing = await res.json();
  } catch (e) {
    return { address, listing: [], error: 'Invalid JSON in listing' };
  }
  return { address, listing };
};
