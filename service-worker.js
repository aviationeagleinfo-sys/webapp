const CACHE_NAME = 'dr-musumeci-v1';
// Elenca qui i file principali che vuoi siano disponibili offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://webapp.drgiuseppemusumeci.com/favicon.ico'
];

// Installazione del Service Worker e salvataggio iniziale in Cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aperta con successo');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  // Forza il Service Worker attivo a prendere subito il controllo
  self.skipWaiting();
});

// Attivazione e pulizia delle vecchie cache (gestione aggiornamenti)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Rimozione vecchia cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Strategia di recupero: Prima la rete, se fallisce (offline) usa la cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se la risposta è valida, la duplichiamo nella cache aggiornandola
        if (event.request.method === 'GET' && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Se la rete fallisce (siamo offline), cerca nella cache
        return caches.match(event.request);
      })
  );
});
