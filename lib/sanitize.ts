import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitasi HTML konten CMS (blog/agenda) sebelum di-render dengan
 * dangerouslySetInnerHTML. Backend sudah menyaring (allow-list di
 * App\Services\HtmlSanitizer), ini lapisan kedua (defense in depth)
 * untuk mencegah stored XSS bila filter backend terlewat/di-bypass.
 *
 * Allow-list tag/atribut disamakan dengan HtmlSanitizer backend.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'span', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sub', 'sup',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
  'hr', 'div', 'iframe',
];

const ALLOWED_ATTR = [
  'href', 'title', 'target', 'rel',
  'src', 'alt', 'width', 'height', 'loading',
  'class', 'id', 'style',
  'colspan', 'rowspan',
  'allow', 'allowfullscreen', 'frameborder',
];

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    // Blokir skema berbahaya (javascript:, data:, vbscript:).
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
    FORBID_TAGS: ['script', 'style', 'object', 'embed', 'form', 'input', 'button'],
  });
}

/**
 * Escape nilai agar aman dimasukkan ke dalam blok <script type="application/ld+json">.
 * Mencegah breakout `</script>` pada data dari DB.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
