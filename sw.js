// ── Service Worker — MAC Louga ─────────────────────────────────────────────────
const CACHE_NAME = 'mac-louga-v1';
const FILES = [
  './',
  './index.html',
  './manifest.json',
];

// Installation — mise en cache de l'application
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('MAC Louga: mise en cache pour hors connexion');
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

// Activation — nettoyage des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Interception des requêtes — servir depuis le cache si hors ligne
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        // Mettre en cache les nouvelles ressources
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
        }
        return response;
      }).catch(() => {
        // Hors connexion — retourner la page principale
        return caches.match('./index.html');
      });
    })
  );
});
