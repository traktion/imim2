import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch }) => {
  const { address, path } = params as { address: string; path: string };

  const backendUrl = `http://${address}/${path}`;
  const res = await fetch(backendUrl);
  
  if (!res.ok) {
    throw error(res.status, `Failed to fetch from backend: ${res.statusText}`);
  }

  return new Response(res.body, {
    headers: {
      'content-type': res.headers.get('content-type') || 'application/octet-stream',
      'cache-control': 'public, max-age=3600'
    }
  });
};
