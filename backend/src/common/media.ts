export function mediaPath(filename: string) {
  return `/api/v1/media/${filename}`;
}

export function rewriteMediaUrl(url: string) {
  if (!url) return url;
  if (/^https?:\/\/.+(unsplash|images)/i.test(url) && !url.includes('/uploads/')) {
    return url;
  }
  const match = url.match(/\/(?:uploads|media)\/([^/?#]+)/);
  return match ? mediaPath(match[1]) : url;
}
