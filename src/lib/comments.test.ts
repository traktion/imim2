import { describe, it, expect, vi } from 'vitest';
import { getCommentKey, getComments } from './comments';

describe('comments utility', () => {
  it('generates correct comment keys', () => {
    expect(getCommentKey('blogname', 'article.md', 1)).toBe('imim_blogname_article_comment1');
    expect(getCommentKey('blog', 'folder/article.md', 2)).toBe('imim_blog_article_comment2');
  });

  it('fetches comments sequentially', async () => {
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

    const comments = await getComments('blog', 'article.md', mockFetch as any);
    
    expect(comments).toHaveLength(2);
    expect(comments[0]).toEqual({ text: 'Comment 1', address: 'addr1' });
    expect(comments[1]).toEqual({ text: 'Comment 2', address: 'addr2' });
    expect(mockFetch).toHaveBeenCalledTimes(5); // 3 graph_entry attempts (1, 2, 3-fails) + 2 public_data fetches
  });
});
