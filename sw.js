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
//Activate event: clean old caches
self.addEventListener('activate',(event)=>{
    event.waitUntil(
        caches.keys().then((cacheNames)=>{
            return Promise.all(
                cacheNames.map((cacheName)=>{
                    if (cacheName !== CACHE_NAME){
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(()=>self.clients.claim())
    );
});
// end activate event

//Fetch Event: Try network first,then cache 
self.addEventListener('fetch',(event)=>{
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }
    event.respondWith(
        fetch(event.request)
            .then((networkResponse)=>{
                if (networkResponse && networkResponse.status === 200){
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache)=>{
                        cache.put(event.request, responseClone);
                    });
                }
                return networkResponse;
        })
    .catch((error)=>{
        return caches.match(event.request);
    })
    );
});