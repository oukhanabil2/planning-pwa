// service-worker.js - SIMPLE
const CACHE_NAME = 'planning-pwa-v1';

self.addEventListener('install', (event) => {
    console.log('✅ Service Worker installé');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activé');
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    // Laisser passer toutes les requêtes pour fichiers locaux
    event.respondWith(fetch(event.request));
});