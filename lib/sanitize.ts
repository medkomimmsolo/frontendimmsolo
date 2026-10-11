/**
 * Sanitasi HTML konten CMS (blog/agenda) sebelum di-render dengan
 * dangerouslySetInnerHTML.
 *
 * Backend sudah menyaring dengan App\Services\HtmlSanitizer di server.
 * Fungsi ini memberikan lapisan pertahanan kedua murni JS tanpa ketergantungan jsdom,
 * sehingga aman dan bebas error di lingkungan serverless/Vercel maupun edge runtime.
 */

// Tag terlarang yang berisiko script execution atau frame injection
const FORBIDDEN_TAGS_REGEX = /<\s*(script|object|embed|form|input|button|link|meta|base|applet)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>|<\s*(script|object|embed|form|input|button|link|meta|base|applet)[^>]*\/?>/gi;

// Atribut event listener berbahaya (onclick, onerror, onload, onmouseover, dll.)
const EVENT_HANDLER_REGEX = /\s+on[a-z0-9_-]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi;

// Skema URL berbahaya di dalam atribut href/src (javascript:, vbscript:, data:text/html)
const DANGEROUS_PROTO_REGEX = /\s+(href|src)\s*=\s*("|')(?:javascript:|vbscript:|data:text\/html)[^"']*\2/gi;

export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';
  return dirty
    .replace(FORBIDDEN_TAGS_REGEX, '')
    .replace(EVENT_HANDLER_REGEX, '')
    .replace(DANGEROUS_PROTO_REGEX, '');
}

/**
 * Escape nilai agar aman dimasukkan ke dalam blok <script type="application/ld+json">.
 * Mencegah breakout `</script>` pada data dari DB.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
