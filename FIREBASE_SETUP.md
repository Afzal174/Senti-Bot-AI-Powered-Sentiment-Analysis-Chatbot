# Firebase Cloud Messaging (FCM) Setup Guide for SentiBot

This guide will help you set up Firebase Cloud Messaging for push notifications in SentiBot.

## Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com/)
2. Firebase Admin SDK credentials file
3. Firebase web app configuration

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Note down your Project ID

## Step 2: Generate Firebase Admin SDK Credentials

1. In Firebase Console, go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Download the JSON file and rename it to `firebase-credentials.json`
4. Place this file in the root directory of your SentiBot project

## Step 3: Add Firebase Web App

1. In Firebase Console, go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click the web icon (</>) to add a web app
4. Register your app with a nickname (e.g., "SentiBot Web")
5. Copy the Firebase configuration object

## Step 4: Update Frontend Configuration

1. Open `frontend/src/firebase-config.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

## Step 5: Generate VAPID Key

1. In Firebase Console, go to Project Settings > Cloud Messaging
2. Scroll to "Web configuration" section
3. Click "Generate key pair" under "Web Push certificates"
4. Copy the generated key

## Step 6: Update Frontend Utility

1. Open `frontend/src/utils/firebaseMessaging.js`
2. Replace `YOUR_VAPID_KEY` with your actual VAPID key:

```javascript
const token = await getToken(messaging, {
  vapidKey: 'YOUR_ACTUAL_VAPID_KEY'
});
```

## Step 7: Update Service Worker

1. Open `frontend/public/firebase-messaging-sw.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
firebase.initializeApp({
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
});
```

## Step 8: Add Environment Variable (Optional)

Add the path to your Firebase credentials file in `.env`:

```
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
```

## Step 9: Test the Integration

1. Start your Flask backend:
   ```bash
   python app.py
   ```

2. Start your React frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open the application in your browser
4. Click "Enable Notifications" when prompted
5. Grant notification permission
6. Check the browser console for FCM token

## API Endpoints

### Register FCM Token
```
POST /api/fcm/register
Content-Type: application/json

{
  "fcm_token": "YOUR_FCM_TOKEN",
  "username": "username"
}
```

### Send FCM Notification
```
POST /api/fcm/send
Content-Type: application/json

{
  "username": "username",
  "title": "Notification Title",
  "body": "Notification Body"
}
```

## Troubleshooting

### "Firebase credentials file not found"
- Make sure `firebase-credentials.json` is in the root directory
- Check the `FIREBASE_CREDENTIALS_PATH` environment variable

### "No FCM tokens found for user"
- User needs to enable notifications in the browser
- Check if the FCM token was registered successfully

### "Notification permission denied"
- User needs to grant notification permission in browser settings
- Check browser console for errors

### Service Worker not registering
- Make sure `firebase-messaging-sw.js` is in the `frontend/public` folder
- Check browser console for service worker errors
- Ensure the file is accessible at the root of your domain

## Additional Resources

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Web Push Notifications](https://developers.google.com/web/fundamentals/push-notifications)
