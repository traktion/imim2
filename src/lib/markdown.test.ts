import { describe, it, expect } from 'vitest';
import { sanitizeHtml, htmlToMarkdown, normalizeMarkdown, markdownToHtml } from './markdown';

describe('markdown utils', () => {
  it('sanitizes empty <p> tags', () => {
    const html = '<p>hello</p><p> </p><p>\n</p><p><br></p><p>world</p>';
    expect(sanitizeHtml(html)).toBe('<p>hello</p><p>world</p>');
  });

  it('converts simple HTML to markdown', () => {
    const html = '<h1>Title</h1><p><em>italics</em> and <strong>bold</strong></p>';
    expect(htmlToMarkdown(html)).toBe('# Title\n\n*italics* and **bold**');
  });

  it('normalizes markdown whitespace', () => {
    const md = 'Line 1  \r\n\r\nLine 2   ';
    expect(normalizeMarkdown(md)).toBe('Line 1\n\nLine 2');
  });

  it('markdownToHtml produces HTML for seeding', () => {
    const md = '# Hello';
    const html = markdownToHtml(md);
    expect(typeof html).toBe('string');
    expect(html).toMatch(/<h1.*?>Hello<\/h1>/);
  });
});
