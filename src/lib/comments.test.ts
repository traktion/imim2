import { describe, it, expect, vi } from 'vitest';
import { getCommentKey, getComments } from './comments';

describe('comments utility', () => {
  it('generates correct comment keys', () => {
    expect(getCommentKey('blogname', 'article.md', 1)).toBe('imim_blogname_article_comment1');
    expect(getCommentKey('blog', 'folder/article.md', 2)).toBe('imim_blog_article_comment2');
  });

  it('fetches comments in batches and calls onComment', async () => {
    const mockFetch = vi.fn()
      .mockImplementation(async (url) => {
        if (url === '/anttp-0/graph_entry/imim_blog_article_comment1') {
          return { ok: true, json: async () => ({ content: 'addr1' }) };
        }
        if (url === '/anttp-0/binary/public_data/addr1') {
          return { ok: true, text: async () => 'Comment 1' };
        }
        if (url === '/anttp-0/graph_entry/imim_blog_article_comment2') {
          return { ok: true, json: async () => ({ content: 'addr2' }) };
        }
        if (url === '/anttp-0/binary/public_data/addr2') {
          return { ok: true, text: async () => 'Comment 2' };
        }
        return { ok: false, status: 404 };
      });

    const receivedComments: any[] = [];
    await getComments('blog', 'article.md', (c) => {
      // Find and update or add
      const idx = receivedComments.findIndex(rc => rc.address === c.address);
      if (idx !== -1) {
        receivedComments[idx] = { ...c };
      } else {
        receivedComments.push({ ...c });
      }
    }, mockFetch as any);
    
    // We expect 2 comments eventually
    // Since fetches are async, we might need to wait for them. 
    // In a test with vi.fn() that returns resolved promises, they will resolve in the next microtick.
    // But getComments itself is async and we awaited it. 
    // Wait, getComments now finishes graph entries, but the public_data fetches might still be pending.
    
    // Let's use a small helper to wait for the expected state
    const waitFor = async (fn: () => void, timeout = 1000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        try {
          fn();
          return;
        } catch (e) {
          await new Promise(r => setTimeout(r, 10));
        }
      }
      fn(); // Final attempt to throw
    };

    await waitFor(() => {
      expect(receivedComments).toHaveLength(2);
      expect(receivedComments[0].text).toBe('Comment 1');
      expect(receivedComments[0].loading).toBe(false);
      expect(receivedComments[1].text).toBe('Comment 2');
      expect(receivedComments[1].loading).toBe(false);
    });
    
    // It should have tried to fetch 2 graph entries for the first batch
    expect(mockFetch).toHaveBeenCalledWith('/anttp-0/graph_entry/imim_blog_article_comment1', expect.anything());
    expect(mockFetch).toHaveBeenCalledWith('/anttp-0/graph_entry/imim_blog_article_comment2', expect.anything());
    // Since we found addr2 at comment2, it should continue to the next batch
    expect(mockFetch).toHaveBeenCalledWith('/anttp-0/graph_entry/imim_blog_article_comment3', expect.anything());
  });
});
