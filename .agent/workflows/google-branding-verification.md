---
description: How to fix Google Branding Verification
---

If you see the message **"Your branding needs to be verified,"** it means Google is protecting users from unknown apps. Until you finish this, the name **GenSpark** won't show to everyone.

### 1. Requirements for Verification
Google will only approve your branding if you provide these:
- **Privacy Policy URL**: (Required) A link to your app's privacy rules.
- **Terms of Service URL**: A link to your app's rules.
- **Authorized Domain**: You must prove you own the domain (e.g., `supabase.co` is not yours, so you can't verify it).

### 2. The "Subdomain" Problem
Because you are using `...supabase.co`, you **cannot** fully verify the branding. Google only allows you to verify domains that **you own**. 

### 3. Recommendation: Get a Custom Domain
This is the **only way** to remove the "unverified" warning and show the name **GenSpark** professionally:
1. Buy a domain (e.g., `genspark.io` or `genspark.com`).
2. Verify it in [Google Search Console](https://search.google.com/search-console).
3. Add that domain to your Google Cloud **Authorized domains**.
4. Use that domain as your **Application home page**.

### 4. Temporary Workaround (Removing the Warning)
If you just want to log in for now:
1. When you see the "Google hasn't verified this app" screen:
2. Click **Advanced**.
3. Click **Go to GenSpark (unsafe)** at the bottom.
4. It will let you log in, but it will still show the URL instead of the name.

> [!TIP]
> To look like a real, high-end app, I highly recommend buying a **Custom Domain**. Once you have one, I can help you set up the Privacy Policy and submit it for verification!
