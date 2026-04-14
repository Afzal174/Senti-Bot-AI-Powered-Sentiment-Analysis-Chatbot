# Firebase Credentials Setup Guide for SentiBot

This guide will walk you through setting up Firebase credentials step-by-step to enable push notifications in SentiBot.

## Prerequisites

- A Google account
- Access to Firebase Console (https://console.firebase.google.com/)

---

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or select an existing project
3. Enter a project name (e.g., "SentiBot")
4. Choose whether to enable Google Analytics (optional)
5. Click **"Create project"**
6. Wait for the project to be created, then click **"Continue"**

---

## Step 2: Generate Firebase Admin SDK Credentials

1. In Firebase Console, click the **gear icon** (⚙️) next to "Project Overview"
2. Select **"Project settings"**
3. Go to the **"Service accounts"** tab
4. Click **"Generate new private key"**
5. A JSON file will be downloaded - this is your credentials file
6. **Rename the downloaded file to `firebase-credentials.json`**
7. **Move this file to the root directory of your SentiBot project** (same folder as `app.py`)

**Important:** Keep this file secure and never commit it to version control!

---

## Step 3: Add Firebase Web App

1. In Firebase Console, go to **"Project settings"** > **"General"** tab
2. Scroll down to **"Your apps"** section
3. Click the **web icon** (`</>`) to add a web app
4. Enter a nickname (e.g., "SentiBot Web")
5. **Do NOT** check "Also set up Firebase Hosting" (unless you want to use it)
6. Click **"Register app"**
7. You'll see a configuration object - **copy these values** (you'll need them in the next steps)

---

## Step 4: Update Frontend Configuration

Open the file `frontend/src/firebase-config.js` and replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // From Firebase Console
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"     // Optional
};
```

**Example of what it should look like:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz",
  authDomain: "sentibot-12345.firebaseapp.com",
  projectId: "sentibot-12345",
  storageBucket: "sentibot-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-ABCDEF1234"
};
```

---

## Step 5: Generate VAPID Key

1. In Firebase Console, go to **"Project settings"** > **"Cloud Messaging"** tab
2. Scroll down to **"Web configuration"** section
3. Under **"Web Push certificates"**, click **"Generate key pair"**
4. Copy the generated key (it looks like a long string)

---

## Step 6: Update Frontend Utility

Open the file `frontend/src/utils/firebaseMessaging.js` and replace `YOUR_VAPID_KEY` with your actual VAPID key:

```javascript
const token = await getToken(messaging, {
  vapidKey: 'YOUR_ACTUAL_VAPID_KEY'  // Replace this with your VAPID key
});
```

**Example:**
```javascript
const token = await getToken(messaging, {
  vapidKey: 'BNx5V7J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8a9b0c1d2e3f4g5h6i7j8k9l0'
});
```

---

## Step 7: Update Service Worker

Open the file `frontend/public/firebase-messaging-sw.js` and replace the placeholder values with your actual Firebase configuration:

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

**Note:** Use the same values from Step 4.

---

## Step 8: Add Environment Variable (Optional)

Add the path to your Firebase credentials file in the `.env` file:

```
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
```

This tells the backend where to find the credentials file.

---

## Step 9: Verify Setup

1. **Start your Flask backend:**
   ```bash
   python app.py
   ```
   
   You should see:
   ```
   Firebase Admin SDK initialized successfully
   ```
   
   Instead of:
   ```
   Firebase credentials file not found at 'firebase-credentials.json'. FCM notifications disabled.
   ```

2. **Start your React frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test the notification permission:**
   - Log in to SentiBot
   - Go to the Profile page
   - Click "Enable Notifications"
   - Allow notification permission when prompted
   - You should see "Notifications enabled successfully!"

---

## Troubleshooting

### Issue: "Firebase credentials file not found"
- Make sure `firebase-credentials.json` is in the root directory (same folder as `app.py`)
- Check that the file name is exactly `firebase-credentials.json`
- Verify the file is valid JSON

### Issue: "Firebase messaging initialization failed"
- Check that your Firebase configuration in `frontend/src/firebase-config.js` is correct
- Verify all required fields are filled in (apiKey, authDomain, projectId, messagingSenderId, appId)

### Issue: "No FCM tokens found for user"
- Make sure you've enabled notifications in the browser
- Check that the VAPID key is correct in `frontend/src/utils/firebaseMessaging.js`
- Verify the service worker is properly configured

### Issue: Notifications not working
- Check browser console for errors
- Verify Firebase Cloud Messaging is enabled in Firebase Console
- Make sure you're using HTTPS (required for notifications in production)

---

## File Locations Summary

| File | Location | Purpose |
|------|----------|---------|
| `firebase-credentials.json` | Project root (same as `app.py`) | Backend Firebase Admin SDK credentials |
| `frontend/src/firebase-config.js` | Frontend source | Frontend Firebase configuration |
| `frontend/src/utils/firebaseMessaging.js` | Frontend source | FCM token management |
| `frontend/public/firebase-messaging-sw.js` | Frontend public | Service worker for background notifications |
| `.env` | Project root | Environment variables (optional) |

---

## Security Notes

1. **Never commit `firebase-credentials.json` to version control**
   - Add it to `.gitignore` if you're using Git
   
2. **Keep your API keys secure**
   - Don't share them publicly
   - Use environment variables when possible

3. **Restrict API keys in Firebase Console**
   - Go to Project Settings > General
   - Click on your app
   - Add restrictions (HTTP referrers, IP addresses, etc.)

---

## Next Steps

After completing this setup:
1. Test the notification permission flow
2. Send a test notification using the `/api/fcm/send` endpoint
3. Customize notification content as needed

For more information, refer to:
- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
