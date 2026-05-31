// 1. IMPORTAZIONE DI ONESIGNAL (In cima a tutto)
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

// 2. CONFIGURAZIONE CACHE DELLA PWA
const CACHE_NAME = 'dr-musumeci-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://webapp.drgiuseppemusumeci.com/favicon.ico'
];

// Installazione e salvataggio iniziale in Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Attivazione e pulizia delle vecchie cache
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

// Strategia di recupero: Prima la rete, se fallisce usa la cache
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Escludi le pagine dei software interni o admin dal caching
  if (url.pathname.startsWith('/software/') || url.pathname.startsWith('/admin/')) {
    return; 
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (event.request.method === 'GET' && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
