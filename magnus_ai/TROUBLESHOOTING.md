# 🚨 READ FIRST: Fixing Common Configuration Errors 🚨

If you encounter authentication errors, it's almost always a configuration issue in the Google Cloud or Azure portals. **These cannot be fixed with code changes.**

---

### ✅ Fixing Google Sign-In (`origin_mismatch` or `GSI_LOGGER`)

If your app shows a `[GSI_LOGGER]: The given origin is not allowed...` error, it means your OAuth Client ID is not configured with the correct **Authorized JavaScript origin**.

**You MUST follow these steps exactly:**

1.  **Go to your Google Cloud Credentials Page**:
    *   Open this link in your browser: [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
2.  **Select Your Client ID**:
    *   Find the **OAuth 2.0 Client ID** that you are using in your `config.ts` file.
    *   Click on its name to edit it.
3.  **Add Your App's URL**:
    *   Scroll down to the **"Authorized JavaScript origins"** section.
    *   Click **"+ ADD URI"**.
    *   Enter the **exact URL** where your application is running.
        *   If you are testing locally, this is probably `http://localhost:3000` (or whichever port you use).
        *   If you deployed your app, it is the live URL (e.g., `https://your-app.com`).
    *   **Important:** Do not add a path or a slash at the end (e.g., use `http://localhost:3000`, not `http://localhost:3000/`).
4.  **Save and Wait**:
    *   Click the **"Save"** button at the bottom.
    *   **Wait up to 5 minutes** for the changes to apply. Then, clear your browser cache and refresh the app.
