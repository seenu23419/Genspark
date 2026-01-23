# How to Add Push Notifications to GenSpark

To add "app-like" push notifications (e.g., "New Lesson Unlocked", "Daily Reminder"), you need a **Push Notification Provider**.

We recommend **OneSignal** because it is free for up to 10k users, specialized for React/PWAs, and easier than building your own server infrastructure.

## Step 1: Create a OneSignal Account
1.  Go to [OneSignal.com](https://onesignal.com/) and Sign Up (Free).
2.  Create a newly "App / Website".
3.  Select **Web Push**.
4.  Choose **Custom Code** (since we are building a custom React app).
5.  Enter your site URL (e.g., `https://genspark.vercel.app`) - or `http://localhost:3000` for testing (requires enabling "Local Testing" in OneSignal).
6.  **Important**: Save the **App ID** they give you.

## Step 2: Install the Library
Run this command in your terminal:
```bash
npm install react-onesignal
```

## Step 3: Add the OneSignal Service Worker
OneSignal requires a specific file in your `public` folder to work in the background.
1.  Download the **OneSignal SDK Files** (provided in their dashboard setup step 4).
2.  Usually, this is `OneSignalSDKWorker.js`.
3.  Place `OneSignalSDKWorker.js` inside your `public/` folder.

## Step 4: Initialize in `App.tsx`
Modify your `App.tsx` to initialize OneSignal when the app starts.

```typescript
import OneSignal from 'react-onesignal';

// Inside App component, in a useEffect:
useEffect(() => {
  const runOneSignal = async () => {
    await OneSignal.init({ 
      appId: "YOUR-ONESIGNAL-APP-ID-HERE", 
      allowLocalhostAsSecureOrigin: true, // Remove this in production
      promptOptions: {
        slidedown: {
          prompts: [
            {
              type: "category",
              autoPrompt: true,
              text: {
                actionMessage: "Get notified about new coding challenges?",
                acceptButton: "Allow",
                cancelButton: "Later"
              },
              delay: {
                pageViews: 1,
                timeDelay: 20
              }
            }
          ]
        }
      }
    });
    console.log("OneSignal Initialized");
  };

  runOneSignal();
}, []);
```

## Step 5: Send a Notification
Once integrated, you can go to the OneSignal Dashboard -> messages -> New Push.
- Title: "Code Review Ready!"
- Message: "Your Python solution has been graded."
- Click **Send**.

All users who clicked "Allow" will receive the notification on their phone/desktop, even if the app is closed!
