/* Danara PWA service worker — cache cangkang aplikasi, API & CDN selalu lewat jaringan */
const CACHE = 'danara-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return; // Apps Script/CDN: tidak di-cache
  if (r.mode === 'navigate') { // halaman: utamakan versi terbaru, cadangan dari cache
    e.respondWith(fetch(r).then(res => {
      const cp = res.clone(); caches.open(CACHE).then(c => c.put('index.html', cp)); return res;
    }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(r).then(h => h || fetch(r).then(res => {
    const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res;
  })));
});
