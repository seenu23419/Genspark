---
description: How to recreate Google Cloud OAuth credentials for GenSpark (Multi-Platform)
---

To ensure a professional experience on Android, iOS, and Desktop, you need to configure your Google Cloud project for all platforms.

### 1. Create a New Google Cloud Project
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown top-left and select **New Project**.
3. Name it **"GenSpark"** and create.

### 2. Configure OAuth Consent Screen (Universal Branding)
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** and click **Create**.
3. **App Information**:
   - App name: **GenSpark**
   - User support email: (Your email)
   - App logo: (Upload your logo - this will show on all devices)
4. **Developer contact info**: (Your email).
5. Click **Save and Continue** until finished.
6. **IMPORTANT**: Click **Publish App** on the OAuth consent screen dashboard to move it from "Testing" to "In Production". This removes the "App not verified" warning.

### 3. Create Credentials for Desktop & Supabase (Web Client)
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Select **Web application**.
4. **Name**: `Web Client (Supabase & Desktop)`
5. **Authorized redirect URIs**:
   - Add: `https://aoiagnnkhaswpmhbobhd.supabase.co/auth/v1/callback`
6. Click **Create**. **Copy the Client ID and Client Secret.** (You will put these in Supabase).

### 4. Create Credentials for Android (Play Store)
1. Click **Create Credentials** > **OAuth client ID**.
2. Select **Android**.
3. **Name**: `Android App`
4. **Package name**: `com.genspark.app` (This must match your `capacitor.config.json` and AndroidManifest.xml).
5. **SHA-1 certificate fingerprint**: 
   - To get this, run this command in your terminal: `./gradlew signingReport` inside the `android` folder.
   - Look for the **SHA1** value under the `debug` or `release` variant.
6. Click **Create**. (Google now "trusts" your Android app).

### 5. Create Credentials for iOS (App Store)
1. Click **Create Credentials** > **OAuth client ID**.
2. Select **iOS**.
3. **Name**: `iOS App`
4. **Bundle ID**: `com.genspark.app` (This must match your Xcode project).
5. Click **Create**.

### 6. Update Supabase
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** > **Providers** > **Google**.
3. **Paste the NEW Client ID and Client Secret from the "Web application" you created in Step 3.**
4. Click **Save**.

### 7. Clean Up
1. In Google Cloud Console, switch to your **old** project (if it exists).
2. Go to **IAM & Admin** > **Settings**.
3. Click **Shut Down** to delete the old project.
