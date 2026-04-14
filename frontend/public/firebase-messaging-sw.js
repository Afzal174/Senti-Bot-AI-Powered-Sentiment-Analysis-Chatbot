// Firebase Cloud Messaging Service Worker
// This file must be in the public folder to be accessible at the root of your domain

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBApN1AmrjembmhzPul1Y_tYAonSnklNpo",
  authDomain: "senti-bot-64d3d.firebaseapp.com",
  projectId: "senti-bot-64d3d",
  storageBucket: "senti-bot-64d3d.firebasestorage.app",
  messagingSenderId: "90696482520",
  appId: "1:90696482520:web:854d210c98b63354a9a1ad"
});

// Retrieve Firebase Messaging object
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'SentiBot Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new notification',
    icon: payload.notification.icon || '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'sentiBot-notification',
    data: payload.data
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click: ', event);
  
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: "window"
    })
    .then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === '/' && 'focus' in client)
          return client.focus();
      }
      if (clients.openWindow)
        return clients.openWindow('/');
    })
  );
});
