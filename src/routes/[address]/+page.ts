import type { PageLoad } from './$types';

export const ssr = false;

export const load: PageLoad = async ({ params, fetch, data }) => {
  const address = params.address;
  const url = `http://${address}/`;
  const res = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });
  if (!res.ok) {
    return { address, listing: [], error: `Failed to fetch listing (${res.status})` };
  }
  let listing: any = [];
  try {
    listing = await res.json();
  } catch (e) {
    return { address, listing: [], error: 'Invalid JSON in listing' };
  }
  return { ...data, listing };
};
