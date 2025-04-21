// This script registers the service worker for Comfort Stay PG

// Wait for the page to load
window.addEventListener('load', () => {
  // Check if service workers are supported
  if ('serviceWorker' in navigator) {
    registerServiceWorker();
  } else {
    console.log('Service workers are not supported in this browser');
  }
});

// Register the service worker
async function registerServiceWorker() {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    
    console.log('Service Worker registered successfully with scope:', registration.scope);
    
    // Check if there's a waiting service worker
    if (registration.waiting) {
      console.log('New Service Worker waiting');
      // You can notify the user about the update here
    }
    
    // Handle Service Worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      
      if (newWorker) {
        console.log('New Service Worker installing');
        
        newWorker.addEventListener('statechange', () => {
          console.log('Service Worker state changed to:', newWorker.state);
          
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('New Service Worker installed and waiting');
            // You can notify the user about the update here
          }
        });
      }
    });
    
    // Listen for controller change
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('Service Worker controller changed');
      // You might want to reload the page here
      // window.location.reload();
    });
    
  } catch (error) {
    console.error('Service Worker registration failed:', error);
  }
}

// Function to check if Push notifications are supported
function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

// Function to send message to the Service Worker
function sendMessageToServiceWorker(message) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(message);
    return true;
  }
  return false;
}

// Export functions for use in components
window.swHelper = {
  isPushNotificationSupported,
  sendMessageToServiceWorker
}; 