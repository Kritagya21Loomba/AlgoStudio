const CACHE_NAME = 'algostudio-v2';
const PRECACHE_URLS = [
  '/',
  '/sorting/bubble-sort',
  '/sorting/insertion-sort',
  '/sorting/selection-sort',
  '/sorting/merge-sort',
  '/sorting/quick-sort',
  '/sorting/heap-sort',
  '/searching/binary-search',
  '/graph/bfs',
  '/graph/dfs',
  '/tree/bst',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      // Stale-while-revalidate: return cached, fetch in background
      const fetchPromise = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
