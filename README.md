# ProductStudio92

## TO FIX:
- Currently using Gemini for calendar json generation
- Time is a bit off for gemini, edit the prompt to make it more specific/accurate (ex: give model the current date and time)
- Events not showing up right away on calendar, need to click refresh. --> make AI generated events show up automatically
- creating/deleting events manually is a bit strange right now
- Add functionality to delete/edit events by voice


**📅 Google Calendar Features:**

**View Events:**

-   Click the **Calendar icon** in the header to toggle the calendar panel
-   View your upcoming events for the next 30 days
-   See event details including title, time, location, and description

**Setup Instructions:**

1.  **Get Google OAuth Client ID:**
    -   Go to [Google Cloud Console](https://console.cloud.google.com/)
    -   Create a new project or select existing one
    -   Enable Google Calendar API
    -   Create OAuth 2.0 credentials (Web application)
    -   Add `https://claude.ai` to authorized JavaScript origins
    -   Copy your Client ID
2.  **Update the Code:**
    -   Replace `YOUR_GOOGLE_CLIENT_ID` in line 27 with your actual Client ID
3.  **Sign In:**
    -   Click the Calendar icon
    -   Click "Sign in with Google"
    -   Authorize the app to access your calendar

**Key Features:**

-   ✅ Real-time calendar sync
-   ✅ Create, read, update, and delete events
-   ✅ Beautiful modal interface for event management
-   ✅ Automatic timezone detection
-   ✅ Event validation and error handling
-   ✅ Responsive design that works on all devices
