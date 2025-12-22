const CACHE_NAME = 'planning-pwa-v3';
const urlsToCache = [
  './index.html',    // Chemin relatif plus sûr
  './style.css',
  './app.js',
  './manifest.json'
];

// INSTALLATION : Mise en cache des fichiers essentiels
self.addEventListener('install', event => {
  console.log('✅ Service Worker : Installation en cours...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📂 Cache ouvert, mise en mémoire des fichiers');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATION : Nettoyage des anciens caches
self.addEventListener('activate', event => {
  console.log('✅ Service Worker : Activé');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression de l\'ancien cache :', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH : Stratégie "Cache First" (Rapide et fonctionne hors-ligne)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retourne le fichier du cache s'il existe, sinon fait une requête réseau
        return response || fetch(event.request).then(fetchResponse => {
          // Optionnel : on pourrait ajouter les nouveaux fichiers au cache ici
          return fetchResponse;
        });
      })
      .catch(() => {
        // Si le réseau échoue et que ce n'est pas dans le cache
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});