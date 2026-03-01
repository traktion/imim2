import { describe, it, expect, vi } from 'vitest';
import { getCommentKey, getComments, sanitiseComment, renderComment, publishComment } from './comments';

describe('comments utility', () => {
  describe('publishComment', () => {
    it('successfully publishes a comment', async () => {
      const mockFetch = vi.fn()
        .mockImplementation(async (url, init) => {
          if (url === '/anttp-0/binary/key_value/imim_blog_article_comment1/msg1') {
            return { ok: true };
          }
          return { ok: false };
        });

      const result = await publishComment('blog', 'article.md', 'Hello', 0, mockFetch as any);
      expect(result.success).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith('/anttp-0/binary/key_value/imim_blog_article_comment1/msg1', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: 'Hello'
      }));
    });

    it('handles failure in comment creation', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: false, status: 500, text: async () => 'Error' });
      const result = await publishComment('blog', 'article.md', 'Hello', 0, mockFetch as any);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to create comment');
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
        if (url === '/anttp-0/binary/key_value/imim_blog_article_comment1/msg1') {
          return { ok: true, text: async () => 'Comment 1' };
        }
        if (url === '/anttp-0/binary/key_value/imim_blog_article_comment2/msg1') {
          return { ok: true, text: async () => 'Comment 2' };
        }
        return { ok: false, status: 404 };
      });

    const receivedComments: any[] = [];
    await getComments('blog', 'article.md', (c) => {
      receivedComments.push({ ...c });
    }, mockFetch as any);
    
    expect(receivedComments).toHaveLength(2);
    expect(receivedComments[0].text).toBe('Comment 1');
    expect(receivedComments[0].loading).toBe(false);
    expect(receivedComments[1].text).toBe('Comment 2');
    expect(receivedComments[1].loading).toBe(false);
    
    // It should have tried to fetch 2 entries for the first batch
    expect(mockFetch).toHaveBeenCalledWith('/anttp-0/binary/key_value/imim_blog_article_comment1/msg1', expect.anything());
    expect(mockFetch).toHaveBeenCalledWith('/anttp-0/binary/key_value/imim_blog_article_comment2/msg1', expect.anything());
    // Since we found comment2, it should continue to the next batch
    expect(mockFetch).toHaveBeenCalledWith('/anttp-0/binary/key_value/imim_blog_article_comment3/msg1', expect.anything());
  });
});
