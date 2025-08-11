# How to Deploy Magnus AI for Free

Since Magnus AI is built to run directly in the browser without a server or build step, you can host it for free on any static hosting provider. This guide will walk you through deploying your app using **Netlify**, which is known for its simplicity and generous free tier.

---

### Prerequisites

Before you begin, make sure you have:
1.  **Completed all setup steps** in the `README.md` file, including adding all your API keys to `config.ts`.
2.  **A GitHub Account**: You'll need a place to store your code online.
3.  **A Netlify Account**: You can sign up for free with your GitHub account.

---

### 🚀 Step 1: Push Your Code to GitHub

Your hosting provider needs to access your code. The easiest way is through a Git repository.

1.  **Create a Repository**: Go to [GitHub](https://github.com/new) and create a new repository. You can make it **private** to keep your API keys from being exposed.
2.  **Push Your Code**: Follow the instructions on GitHub to push your local application folder to the newly created repository.

> 🔒 **Security Warning**: Your `config.ts` file contains sensitive API keys. Committing this file to a **public** GitHub repository is a major security risk. For this simple deployment guide, we are assuming you will use a **private** repository. For production applications, you would use environment variables and a build step to protect these keys.

---

### 🚀 Step 2: Deploy with Netlify

1.  **Log in to Netlify** and go to your dashboard.
2.  Click **"Add new site"** and select **"Import an existing project"**.
3.  **Connect to GitHub** and authorize Netlify to access your repositories.
4.  **Select the repository** you just created for Magnus AI.
5.  **Configure Build Settings**: This is the easy part! Because there's no build step, you can use these settings:
    *   **Build command**: Leave this field **blank**.
    *   **Publish directory**: Leave this field **blank** (or set it to `/` or `.`).
6.  Click **"Deploy site"**. Netlify will now deploy your application.

---

### 🚀 Step 3: Update Google Cloud Credentials (Critical Step)

Your app will not be able to log in until you tell Google that your new website URL is allowed to use your API keys.

1.  **Get Your Site URL**: Netlify will assign you a random URL (e.g., `https://your-random-name.netlify.app`). Copy this URL from your Netlify site overview.
2.  **Go to Google Cloud Credentials**: Open your [Google Cloud Credentials page](https://console.cloud.google.com/apis/credentials).
3.  **Edit Your OAuth Client ID**: Find the "OAuth 2.0 Client IDs" section and click on the name of the client ID you created during the initial setup.
4.  **Add the New Origin**:
    *   Scroll down to **"Authorized JavaScript origins"**.
    *   Click **"+ ADD URI"**.
    *   **Paste your Netlify URL** into the field.
5.  **Save your changes**. It may take a few minutes for Google's servers to update.

---

### 🚀 Step 4: You're Live!

Once the DNS changes have propagated (usually within 5-10 minutes), your deployed Magnus AI application should be fully functional. You can visit your Netlify URL and test the login and all other features.

If you ever change your site's domain name in Netlify, remember to repeat **Step 3** to add the new domain to your Google Cloud credentials.
