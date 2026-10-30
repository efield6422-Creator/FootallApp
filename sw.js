const CACHE_NAME = 'football-app-v1';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './chart.min.js',
    './manifest.json'
];
// Install Event: Save statics ot cache
self.addEventListener('install',(event)=>{
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache)=>{
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});
//fetch event: Load from cache if offline
self.addEventListener('fetch',(event)=>{
    event.respondWith(
        caches.match(event.request).then((cachedResponse)=>{
            return cachedResponse || fetch(event.request);
        })
    );
});