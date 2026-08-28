// Mordle service worker – enkel offline-støtte.
// Bump VERSJON ved endringer i statiske filer.
const VERSJON = 'mordle-v1';

const FILER = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/game.js',
  '/manifest.webmanifest',
  '/icons/favicon.svg',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(VERSJON).then((c) => c.addAll(FILER)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((navn) => Promise.all(navn.filter((n) => n !== VERSJON).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

// Navigasjon: nett først (så nye versjoner plukkes opp), cache som reserve.
// Andre filer: cache først, oppdater i bakgrunnen (stale-while-revalidate).
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((svar) => {
          const kopi = svar.clone();
          caches.open(VERSJON).then((c) => c.put('/', kopi));
          return svar;
        })
        .catch(() => caches.match('/'))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cachet) => {
      const oppdater = fetch(req)
        .then((svar) => {
          if (svar.ok) {
            const kopi = svar.clone();
            caches.open(VERSJON).then((c) => c.put(req, kopi));
          }
          return svar;
        })
        .catch(() => cachet);
      return cachet || oppdater;
    })
  );
});
