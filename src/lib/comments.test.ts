import { describe, it, expect, vi } from 'vitest';
import { getCommentKey, getComments, sanitiseComment, renderComment, publishComment } from './comments';

describe('comments utility', () => {
  describe('publishComment', () => {
    it('successfully publishes a comment', async () => {
      const mockFetch = vi.fn()
        .mockImplementation(async (url, init) => {
          if (url === '/anttp-0/binary/public_data') {
            return { ok: true, json: async () => ({ address: 'new_addr' }) };
          }
          if (url === '/anttp-0/graph_entry') {
            return { ok: true };
          }
          return { ok: false };
        });

      const result = await publishComment('blog', 'article.md', 'Hello', 0, mockFetch as any);
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/anttp-0/binary/public_data', expect.objectContaining({
        method: 'POST',
        body: 'Hello'
      }));
      expect(mockFetch).toHaveBeenCalledWith('/anttp-0/graph_entry', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          content: 'new_addr',
          name: 'imim_blog_article_comment1',
          data_key: 'resolver'
        })
      }));
    });

    it('handles failure in public data creation', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'Error' });
      const result = await publishComment('blog', 'article.md', 'Hello', 0, mockFetch as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create public data');
      expect(result.error).toContain('500 Error');
    });
  });

  describe('sanitiseComment', () => {
    it('strips control characters', () => {
      expect(sanitiseComment('Hello\x00World')).toBe('HelloWorld');
    });

    it('strips URLs', () => {
      expect(sanitiseComment('Check this http://example.com link')).toBe('Check this [URL REMOVED] link');
      expect(sanitiseComment('Check this https://example.com link')).toBe('Check this [URL REMOVED] link');
    });

    it('strips swear words', () => {
      expect(sanitiseComment('This is shit')).toBe('This is ****');
      expect(sanitiseComment('FUCK that')).toBe('**** that');
    });

    it('restricts characters to alphanumeric and basic punctuation', () => {
      expect(sanitiseComment('Hello! How are you? (fine) - "quoted" @#$%')).toBe('Hello! How are you? (fine) - "quoted" ');
    });
  });

  describe('renderComment', () => {
    it('renders markdown to HTML', () => {
      const result = renderComment('**bold** and *italic*');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('<em>italic</em>');
    });

    it('sanitises before rendering', () => {
      const result = renderComment('**bold** shit http://example.com');
      expect(result).toContain('<strong>bold</strong>');
      expect(result).toContain('****');
      expect(result).toContain('[URL REMOVED]');
    });
  });

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
