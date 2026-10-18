export function hasMeaningfulBlogContent(html: string): boolean {
  if (typeof DOMParser === 'undefined') return false;

  const document = new DOMParser().parseFromString(html, 'text/html');
  const text = document.body.textContent?.replace(/\u00a0/g, ' ').trim();
  const containsMedia = document.body.querySelector('img, video, iframe') !== null;

  return Boolean(text || containsMedia);
}
