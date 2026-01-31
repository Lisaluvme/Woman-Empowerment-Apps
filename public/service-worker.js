// Service Worker for Women's Empowerment Command Center PWA

const CACHE_NAME = 'empowerment-app-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/css/main.*.css',
  '/static/js/main.*.js',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request because it's consumed by fetch
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response because it's consumed by cache.put
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification handler
self.addEventListener('push', (event) => {
  const options = {
    body: 'Your safety timer needs attention!',
    icon: '/icon-192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'check-in',
        title: 'Check-in Safe',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'emergency',
        title: 'Send SOS',
        icon: '/icons/sos.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Safety Alert', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'check-in') {
    // Handle check-in action
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'emergency') {
    // Handle emergency action
    event.waitUntil(
      clients.openWindow('/')
    );
  } else {
    // Default click action
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});