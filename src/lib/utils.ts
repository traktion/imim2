/**
 * Rewrites relative URLs in an HTML string to be absolute based on an AntTP address.
 * 
 * For example, if address is 'traktion', <img src="pic.jpg"> becomes <img src="http://traktion/pic.jpg">
 */
export function rewriteUrls(html: string, address: string, currentPath: string = ''): string {
  // Simple regex for src and href attributes that don't already have a protocol
  // This handles common cases like src="image.png", src="./image.png", src="/image.png"
  return html.replace(
    /(src|href)=["'](?!https?:\/\/)([^"']+)["']/g,
    (match, attr, url) => {
      // If it's an absolute path from the root, like /logo.png
      if (url.startsWith('/')) {
        return `${attr}="http://${address}${url}"`;
      }
      
      // If it's a relative path, like pic.jpg or ./pic.jpg or ../pic.jpg
      // We need to resolve it relative to the current directory of the article
      const dir = currentPath.split('/').slice(0, -1).join('/');
      const prefix = dir ? `${dir}/` : '';
      
      // Clean up ./ if it exists
      const cleanedUrl = url.startsWith('./') ? url.substring(2) : url;
      
      return `${attr}="http://${address}/${prefix}${cleanedUrl}"`;
    }
  );
}
