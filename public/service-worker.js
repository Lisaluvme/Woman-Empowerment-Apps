// Enhanced Service Worker for Women's Empowerment Command Center PWA

const CACHE_NAME = 'empowerment-app-v4';
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Check if request should be cached (skip chrome-extension, etc.)
const shouldCache = (request) => {
  const url = new URL(request.url);

  // Skip caching for chrome extensions, dev tools, and other unsupported schemes
  if (url.protocol === 'chrome-extension:' ||
      url.protocol === 'moz-extension:' ||
      url.protocol === 'extension:' ||
      url.protocol === 'about:') {
    return false;
  }

  // Skip caching for non-HTTP(S) requests
  if (!url.protocol.startsWith('http')) {
    return false;
  }

  return true;
};

// Beautiful caching strategies
const cacheFirstStrategy = async (request) => {
  if (!shouldCache(request)) {
    return fetch(request);
  }

  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone()).catch(() => {
        // Silently fail if caching is not supported for this request
      });
    }
    return networkResponse;
  } catch (error) {
    // If caching fails, just return the network response
    return fetch(request);
  }
};

const networkFirstStrategy = async (request) => {
  if (!shouldCache(request)) {
    return fetch(request);
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone()).catch(() => {
        // Silently fail if caching is not supported for this request
      });
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
};

// Install event - cache resources with beautiful progress
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Installation complete!');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete!');
      return self.clients.claim();
    })
  );
});

// Fetch event - intelligent caching with beautiful strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip caching for chrome-extension and other unsupported schemes
  if (!shouldCache(request)) {
    return;
  }

  // Cache static assets (CSS, JS, images)
  if (request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request));
  }
  // Network-first for API calls
  else if (request.url.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  }
  // Cache-first for HTML pages
  else if (request.mode === 'navigate') {
    event.respondWith(cacheFirstStrategy(request));
  }
  // Default strategy
  else {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          return response;
        }
        return fetch(request).catch(() => {
          return new Response('Offline', { status: 503 });
        });
      }).catch(() => {
        return fetch(request);
      })
    );
  }
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
