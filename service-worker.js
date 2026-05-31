// 1. IMPORTAZIONE DI ONESIGNAL
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// 2. CONFIGURAZIONE CACHE DELLA PWA (Incrementato la versione per forzare l'aggiornamento)
const CACHE_NAME = 'dr-musumeci-v3';
const ASSETS_TO_CACHE = [
  '.',
  'index.html',
  'manifest.json',
  'https://webapp.drgiuseppemusumeci.com/nosfondologo3.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// STRATEGIA AGGIORNATA: Network-First per evitare blocchi di codice vecchio
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.pathname.startsWith('/software/') || url.pathname.startsWith('/admin/')) {
    return; 
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se la rete risponde, aggiorna la cache e restituisci la risorsa
        if (event.request.method === 'GET' && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se la rete è assente, cerca nella cache
        return caches.match(event.request);
      })
  );
});
