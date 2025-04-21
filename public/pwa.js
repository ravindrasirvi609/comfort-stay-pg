// PWA Registration Script
(function() {
  console.log('PWA: Script loaded');
  
  // Check if service worker is supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      console.log('PWA: Window loaded, registering service worker');
      
      navigator.serviceWorker.register('/sw.js')
        .then(function(registration) {
          console.log('PWA: ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function(error) {
          console.error('PWA: ServiceWorker registration failed: ', error);
        });
    });
  } else {
    console.log('PWA: Service workers not supported in this browser');
  }
})(); 