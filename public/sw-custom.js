// Custom push notification handlers for Comfort Stay PG
// This file adds push notification functionality to the Next.js PWA

self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received:', event);
  
  let data = {};
  
  try {
    data = event.data.json();
    console.log('[Service Worker] Push data:', data);
  } catch (error) {
    console.error('[Service Worker] Error parsing push data:', error);
    data = {
      title: 'New Notification',
      body: event.data ? event.data.text() : 'No details available',
      icon: '/icons/icon-192x192.png'
    };
  }
  
  const title = data.title || 'Comfort Stay PG';
  const options = {
    body: data.body || 'You have a new notification',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/maskable-icon.png',
    data: data.data || { url: data.url || '/' },
    vibrate: [100, 50, 100],
    requireInteraction: true,
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.notification);
  
  event.notification.close();
  
  // Get the URL to open from the notification data or default to homepage
  const urlToOpen = event.notification.data && event.notification.data.url 
    ? new URL(event.notification.data.url, self.location.origin).href
    : '/';
  
  console.log('[Service Worker] Opening URL:', urlToOpen);
  
  // Focus on existing window or open a new one
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        console.log('[Service Worker] Found clients:', clientList.length);
        
        // Try to find a window that's already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            console.log('[Service Worker] Focusing existing client');
            return client.focus();
          }
        }
        
        // If no matching window, open a new one
        if (clients.openWindow) {
          console.log('[Service Worker] Opening new window');
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Listen for message from the main thread
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[Service Worker] Custom push notification handlers loaded'); 