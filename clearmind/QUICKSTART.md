# 🚀 Quick Start Guide

Get ClearMind AI running in under 5 minutes!

## Step 1: Install Dependencies (2 min)

```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

## Step 2: Get API Keys (2 min)

### OpenAI API Key
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-proj-...`)

### Google OAuth Client ID
1. Visit: https://console.cloud.google.com/
2. Create project → Enable Calendar API
3. Credentials → Create OAuth Client ID
4. Type: Web Application
5. Add origin: `http://localhost:3000`
6. Copy Client ID (ends with `.apps.googleusercontent.com`)

## Step 3: Configure Environment (1 min)

```bash
# Copy example file
cp .env.example .env

# Edit .env and add your keys
nano .env  # or use your preferred editor
```

Your `.env` should look like:
```env
OPENAI_API_KEY=sk-proj-YOUR-KEY-HERE
REACT_APP_GOOGLE_CLIENT_ID=YOUR-CLIENT-ID.apps.googleusercontent.com
REACT_APP_API_BASE_URL=http://localhost:5001/api
PORT=5001
```

## Step 4: Run the App (30 sec)

**Terminal 1** - Backend:
```bash
cd server
npm start
```

Wait for: `ClearMind AI Server running on port 5001`

**Terminal 2** - Frontend:
```bash
npm start
```

Browser opens automatically at `http://localhost:3000`

## Step 5: Test It Out!

### Try These Commands:

**For Empathy:**
> "I'm feeling so overwhelmed today, everything is piling up"

**For Scheduling:**
> "Schedule a doctor's appointment tomorrow at 3pm"

**For Advice:**
> "How should I organize my dad's medication schedule?"

## Common First-Time Issues

### "API not configured" warning
- Check: Is your `.env` file in the root directory?
- Check: Did you restart the servers after creating `.env`?

### Microphone not working
- Chrome/Edge: Click the microphone icon in address bar
- Grant permission when prompted
- Refresh the page

### Calendar won't connect
- Check: Did you add `http://localhost:3000` to authorized origins?
- Check: Is Calendar API enabled in Google Cloud Console?

## Next Steps

1. ✅ Connect your Google Calendar in Settings
2. ✅ Try voice input with the microphone button
3. ✅ Create your first event by speaking naturally
4. ✅ Toggle the calendar view to see your schedule

## Architecture at a Glance

```
You speak/type
      ↓
Browser captures (speech-to-text)
      ↓
Frontend sends to Backend
      ↓
OpenAI analyzes intent
      ↓
    Event? → Create in Calendar
    Vent?  → Empathetic response
    Quest? → Helpful advice
      ↓
Response + Text-to-Speech
      ↓
You hear/see the response
```

## Pro Tips

1. **Voice works best:** Speak naturally, like talking to a friend
2. **Be specific with dates:** "Tomorrow at 3" vs "sometime next week"
3. **Just vent:** Say "I just need to vent" if you don't want action
4. **Check calendar:** Use calendar view to see all your events

## Need Help?

- 📖 Full docs: See `README.md`
- 🐛 Issues: Check `CHANGELOG.md` for known issues
- 🚀 Deploy: See `DEPLOYMENT.md` for production setup

---

**You're all set!** Start managing your mental load with ClearMind AI. 🧠
