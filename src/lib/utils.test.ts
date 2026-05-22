import { describe, it, expect } from 'vitest';
import { rewriteUrls } from './utils';

describe('rewriteUrls', () => {
  const address = 'traktion';

  it('rewrites simple relative image src', () => {
    const html = '<img src="pic.jpg">';
    const result = rewriteUrls(html, address);
    expect(result).toBe('<img src="http://traktion/pic.jpg">');
  });

  it('rewrites relative src with ./', () => {
    const html = '<img src="./pic.jpg">';
    const result = rewriteUrls(html, address);
    expect(result).toBe('<img src="http://traktion/pic.jpg">');
  });

  it('rewrites root-relative src', () => {
    const html = '<img src="/logo.png">';
    const result = rewriteUrls(html, address);
    expect(result).toBe('<img src="http://traktion/logo.png">');
  });

  it('resolves relative src based on currentPath', () => {
    const html = '<img src="image.png">';
    const result = rewriteUrls(html, address, 'folder/article.md');
    expect(result).toBe('<img src="http://traktion/folder/image.png">');
  });

  it('wraps h1 in a link when articleLink is provided', () => {
    const html = '<h1>My Article</h1>';
    const articleLink = `/blog/${address}/my-article.md`;
    const result = rewriteUrls(html, address, '', articleLink);
    expect(result).toBe('<h1><a href="/blog/traktion/my-article.md">My Article</a></h1>');
  });

  it('converts video links to video tags', () => {
    const html = '<a href="http://traktion/video.mp4">Watch</a>';
    const result = rewriteUrls(html, address);
    expect(result).toBe('<video src="http://traktion/video.mp4" controls class="w-full h-auto my-4"></video>');
  });
});
