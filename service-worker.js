const CACHE_NAME = 'planning-pwa-v3';

// Fichiers à mettre en cache
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// Installation
self.addEventListener('install', (event) => {
  console.log('✅ Service Worker installé (v3)');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Mise en cache des fichiers');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('✅ Service Worker activé (v3)');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log(`🗑️ Suppression ancien cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retourne le cache si disponible, sinon fetch
        return response || fetch(event.request);
      })
      .catch(() => {
        // Fallback pour les pages
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      })
  );
});