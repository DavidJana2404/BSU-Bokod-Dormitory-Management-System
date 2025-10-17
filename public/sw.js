// Service Worker for better caching and offline support
const CACHE_NAME = 'dms-cache-v1';
const CACHE_ASSETS = [
    '/',
    '/build/assets/',
    '/build/js/',
];

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Caching assets...');
                return cache.addAll(CACHE_ASSETS);
            })
            .catch(err => console.log('Service Worker: Cache failed', err))
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch event with fallback strategy
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') return;
    
    // Skip external requests
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // If successful, cache and return the response
                if (response.ok && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // If fetch fails (502, etc.), try cache first
                return caches.match(event.request)
                    .then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // If no cache, return a fallback for HTML pages
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/offline.html') || 
                                   new Response('Offline - Please check your connection', {
                                       status: 200,
                                       headers: { 'Content-Type': 'text/html' }
                                   });
                        }
                    });
            })
    );
});