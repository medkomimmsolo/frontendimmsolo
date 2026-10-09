const CACHE = 'immsolo-v2';
const OFFLINE_URL = '/offline';
const PRECACHE = [OFFLINE_URL, '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/apple-icon.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // Satu aset gagal tidak boleh menggagalkan seluruh install.
      .then((cache) => Promise.allSettled(PRECACHE.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

/** Simpan ke cache secara aman (kegagalan put tidak boleh jadi unhandled rejection). */
function safePut(request, res) {
  if (!res || !res.ok) return;
  try {
    const copy = res.clone();
    caches.open(CACHE).then((cache) => cache.put(request, copy).catch(() => {}));
  } catch {
    // Response tidak bisa di-clone (mis. stream terkunci) → abaikan.
  }
}

/** Halaman berisi data user login tidak boleh di-cache (perangkat bersama). */
function isPrivatePath(pathname) {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/login');
}

function offlineJsonResponse() {
  return new Response(JSON.stringify({ success: false, message: 'Tidak ada koneksi internet.' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  // Skrip SW sendiri & API rewrite jangan diintersep cache tulis.
  if (url.pathname === '/sw.js') return;

  // API (rewrite /api/* ke backend): network-only. Gagal → 503 JSON,
  // JANGAN throw agar tidak muncul "Uncaught (in promise)".
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request).catch(() => offlineJsonResponse()));
    return;
  }

  // Aset statis: cache-first.
  if (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/images/') || /\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            safePut(request, res);
            return res;
          })
      )
    );
    return;
  }

  // Halaman: network-first.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (request.mode === 'navigate' && res.ok && !isPrivatePath(url.pathname)) {
          safePut(request, res);
        }
        return res;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          // Fallback terakhir navigasi: jangan throw.
          return new Response('Tidak ada koneksi internet.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain' },
          });
        }
        return offlineJsonResponse();
      })
  );
});
