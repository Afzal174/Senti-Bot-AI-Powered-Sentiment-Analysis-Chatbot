// Firebase Cloud Messaging utility for SentiBot
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import firebaseConfig from '../firebase-config';

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging = null;

try {
  messaging = getMessaging(app);
} catch (error) {
  console.error('Firebase messaging initialization failed:', error);
}

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    if (!messaging) {
      console.warn('Firebase messaging not initialized');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: 'YOUR_VAPID_KEY' // Replace with your VAPID key from Firebase Console
      });
      
      console.log('FCM Token:', token);
      return token;
    } else {
      console.log('Notification permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Register FCM token with backend
export const registerTokenWithBackend = async (token, username) => {
  try {
    const response = await fetch('/api/fcm/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fcm_token: token,
        username: username
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('FCM token registered with backend');
      return true;
    } else {
      console.error('Failed to register FCM token:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return false;
  }
};

// Listen for foreground messages
export const onForegroundMessage = (callback) => {
  if (!messaging) {
    console.warn('Firebase messaging not initialized');
    return;
  }

  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    // Show notification
    if (Notification.permission === 'granted') {
      const notificationTitle = payload.notification?.title || 'SentiBot Notification';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: payload.notification?.icon || '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'sentiBot-notification',
        data: payload.data
      };
      
      new Notification(notificationTitle, notificationOptions);
    }
    
    // Call the callback function if provided
    if (callback) {
      callback(payload);
    }
  });
};

// Check if notifications are supported
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

// Check current notification permission
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'unsupported';
  }
  return Notification.permission;
};

export default {
  requestNotificationPermission,
  registerTokenWithBackend,
  onForegroundMessage,
  isNotificationSupported,
  getNotificationPermission
};
