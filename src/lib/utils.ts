/**
 * Rewrites relative URLs in an HTML string to be absolute based on an AntTP address.
 * 
 * For example, if address is 'traktion', <img src="pic.jpg"> becomes <img src="http://traktion/pic.jpg">
 */
export function rewriteUrls(html: string, address: string, currentPath: string = '', articleLink: string = ''): string {
  // Simple regex for src and href attributes that don't already have a protocol
  // This handles common cases like src="image.png", src="./image.png", src="/image.png"
  const rewrittenHtml = html.replace(
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

  // Handle video/audio embeddings
  const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'webm', 'mkv'];
  const audioExtensions = ['mp3', 'wav', 'flac', 'ogg'];

  const finalHtml = rewrittenHtml.replace(
    /<a href="(http:\/\/[^"]+\.([^".]+))">([^<]*)<\/a>/gi,
    (match, url, ext, text) => {
      const lowerExt = ext.toLowerCase();
      if (videoExtensions.includes(lowerExt)) {
        return `<video src="${url}" controls class="w-full h-auto my-4"></video>`;
      }
      if (audioExtensions.includes(lowerExt)) {
        return `<audio src="${url}" controls class="w-full my-4"></audio>`;
      }
      return match;
    }
  );

  if (articleLink) {
    return finalHtml.replace(/<h1>(.*?)<\/h1>/gi, `<h1><a href="${articleLink}">$1</a></h1>`);
  }

  return finalHtml;
}
