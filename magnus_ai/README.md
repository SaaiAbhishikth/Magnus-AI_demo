# Magnus AI ✨

Magnus AI is a sophisticated, professional, and visually stunning agentic AI bot designed for seamless interaction and productivity. It showcases the power of agentic thinking by breaking down responses into clear, understandable steps: Perceive, Reason, Act, and Learn.

## 🚀 Features

- **Agentic Workflow**: Visualizes the AI's thought process (Perceive, Reason, Act, Learn) for full transparency.
- **User Authentication & Persistent Chats**: Secure sign-in with Google to keep your chat history private and synced. All data is stored locally in your browser.
- **Guest Mode & Chat Migration**: Try the app without signing in. On first login, your guest chats are automatically migrated to your user account.
- **Automated Task Execution**: Lets the AI execute real-world actions like scheduling a Google Calendar meeting or sending an email via Gmail, directly from your conversation.
- **Code Generation & Execution**: Ask Magnus to write code and receive a complete, runnable snippet with an explanation and simulated terminal output.
- **Functional Support Form**: A dedicated Help & FAQ page with a contact form that uses Google Apps Script as a serverless backend to send real emails and log queries to a Google Sheet.
- **Multimodal Capabilities**: Analyze uploaded images, generate music concepts, and create detailed study guides.
- **File Integration**: Supports file uploads from your local machine and Google Drive.
- **Real-time Music Generation**: Integrated **PromptDJ** tool allows you to steer a continuous stream of music with text prompts.

---

## ⚙️ Setup and Configuration

This application requires API keys from Google to be fully functional.

> **Having trouble with setup?** Check our **[Troubleshooting Guide](TROUBLESHOOTING.md)** for solutions to common configuration errors.
> 
> **Ready to go live?** Follow our **[Free Deployment Guide](DEPLOYMENT.md)** to get your app on the web.

### Step 1: Edit the Configuration File

This is the most important step. All keys are managed in a single file.

1.  Open the `config.ts` file in your editor.
2.  Paste your keys and URL into the corresponding placeholder strings:

    ```typescript
    // config.ts

    export const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY_HERE";
    export const GOOGLE_MAPS_API_KEY = "PASTE_YOUR_GOOGLE_MAPS_API_KEY_HERE";
    export const GOOGLE_CLIENT_ID = "PASTE_YOUR_GOOGLE_CLIENT_ID_HERE";
    export const GOOGLE_APPS_SCRIPT_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
    ```
3.  Save the file. The next steps will show you how to get these values.

### Step 2: Google Cloud Project Setup

Most of the app's features rely on a single Google Cloud project.

1.  **Enable the APIs**: In your Google Cloud Project, you **MUST** enable the following APIs:
    -   **Generative Language API** (also known as the Gemini API)
    -   **Google Calendar API** (for scheduling meetings)
    -   **Gmail API** (for sending emails)
    -   **Maps Embed API** (for displaying maps)
    -   **Google Picker API** (for Google Drive file uploads)
    -   **YouTube Data API v3** (used by Gemini for video search)

2.  **Create Credentials**:
    -   **API Key**: Go to **Credentials** -> **Create Credentials** -> **API Key**. Copy this key and paste it into `GEMINI_API_KEY` and `GOOGLE_MAPS_API_KEY` in `config.ts`. You can use the same key for both.
    -   **OAuth 2.0 Client ID**:
        1.  Go to **Credentials** -> **Create Credentials** -> **OAuth client ID**.
        2.  Select **Web application** as the type.
        3.  Under **"Authorized JavaScript origins"**, click **"+ ADD URI"** and enter the URL where you will run the app. For local development, this is typically `http://localhost:3000` (or whichever port you use). You can add more URLs later (e.g., for your deployed site).
        4.  Click **Create**.
        5.  Copy the **Client ID** and paste it into `GOOGLE_CLIENT_ID` in `config.ts`.

### Step 3: Google Apps Script Setup (for Support Form)

The support form uses a free, serverless backend. Follow these steps carefully.

1.  **Create and Prepare a Google Sheet**:
    -   Go to [sheets.new](https://sheets.new).
    -   Name it "Magnus AI Support Queries".
    -   Ensure the first tab is named `Sheet1`.
    -   Create headers in the first row: `Timestamp`, `Name`, `Email`, `Query`.
    -   Copy the **Spreadsheet ID** from the URL (the long string between `/d/` and `/edit`).

2.  **Create the Google Apps Script**:
    -   Go to [script.google.com](https://script.google.com) and create a **New project**.
    -   Delete the default content in `Code.gs` and **paste the entire script code from the bottom of this README**.
    -   **Update Configuration**: Edit the `TARGET_EMAIL` and `SHEET_ID` at the top of the script with your email and the Spreadsheet ID you copied.

3.  **Deploy the Script**:
    -   Click **Deploy** -> **New deployment**.
    -   Click the gear icon and choose **Web app**.
    -   **Configuration**:
        -   **Execute as**: `Me`
        -   **Who has access**: `Anyone` **(This is CRITICAL)**
    -   Click **Deploy** and **Authorize access**.
    -   Choose your Google account. You will see a safety warning. Click **Advanced**, then **Go to [Your Project Name] (unsafe)**, then **Allow**.
    -   Copy the final **Web app URL**.

4.  **Add the URL to `config.ts`**: Paste the copied Web app URL into the `GOOGLE_APPS_SCRIPT_URL` constant.

---

## 📜 Google Apps Script Code

Copy and paste this full script into your `Code.gs` file as described in Step 4.

```javascript
// --- CONFIGURATION ---
// The email address that will receive the support queries.
const TARGET_EMAIL = "your-email@example.com";
// The ID of the Google Sheet to log queries to.
const SHEET_ID = "YOUR_SPREADSHEET_ID_HERE";
// The name of the sheet (tab) within your Google Sheet. Defaults to "Sheet1".
const SHEET_NAME = "Sheet1";
// --- END OF CONFIGURATION ---

function doGet(e) {
  return HtmlService.createHtmlOutput(
    "<h1>Magnus AI Support Script is Active</h1><p>The script is deployed correctly. You can now use the support form in the web app.</p>"
  ).setTitle("Magnus AI Support Handler");
}

function doPost(e) {
  try {
    if (!e || !e.parameter || Object.keys(e.parameter).length === 0) {
      throw new Error("Invalid request: No form data received in e.parameter.");
    }

    const data = e.parameter;
    if (!data.name || !data.email || !data.query) {
      const received = JSON.stringify(e.parameter);
      throw new Error(`Missing required fields (name, email, or query). Received: ${received}`);
    }

    const queryData = { name: data.name, email: data.email, query: data.query };

    logToSheet(queryData);
    sendEmailNotification(queryData);
    sendConfirmationEmail(queryData);
    
    return createJsonResponse({ "status": "success" });

  } catch (error) {
    console.error(`doPost Error: ${error.toString()}.`);
    // Even if there is an error, return a success response to the client to avoid CORS issues.
    // The error is logged on the server side for debugging.
    return createJsonResponse({ "status": "error", "message": error.toString() });
  }
}

function logToSheet(data) {
  if (!SHEET_ID || SHEET_ID === 'YOUR_SPREADSHEET_ID_HERE') return;
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    sheet.appendRow([new Date(), data.name, data.email, data.query]);
  } catch (error) {
     console.error(`Error writing to Google Sheet: ${error.toString()}`);
  }
}

function sendEmailNotification(data) {
  try {
    const subject = `New Magnus AI Support Query from ${data.name}`;
    const body = `You have a new support query:\n\nName: ${data.name}\nEmail: ${data.email}\n\nQuery:\n${data.query}`;
    MailApp.sendEmail(TARGET_EMAIL, subject, body);
  } catch (error) {
    console.error(`Error sending notification email: ${error.toString()}`);
  }
}

function sendConfirmationEmail(data) {
  try {
    const subject = 'Your Magnus AI Support Query has been received';
    const body = `Hello ${data.name},\n\nThank you for contacting Magnus AI support.\n\nWe have received your query and will get back to you shortly.\n\nBest,\nThe Magnus AI Team`;
    MailApp.sendEmail(data.email, subject, body);
  } catch (error) {
    console.error(`Error sending confirmation email to user (${data.email}): ${error.toString()}`);
  }
}

function createJsonResponse(responseObject) {
  return ContentService
      .createTextOutput(JSON.stringify(responseObject))
      .setMimeType(ContentService.MimeType.JSON);
}
```