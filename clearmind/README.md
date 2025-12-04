# ClearMind AI

An intelligent voice assistant designed for the **Sandwich Generation** - adults juggling the care of aging parents while raising their own children. ClearMind AI provides empathetic listening, automatic scheduling, and intelligent workload management.

## 🎯 Product Vision

ClearMind AI is a proactive mental load manager that:
- Doesn't require you to type - just speak naturally
- Transforms mental chaos into smaller, manageable actions
- Takes in emotional input to organize and prioritize tasks
- Provides empathetic support during overwhelming moments

## ✨ Features

### Phase 1 (Current)
- **Voice-to-Text**: Hands-free input using browser speech recognition
- **Smart Intent Detection**: AI determines if you need empathy, advice, or event scheduling
- **Empathetic Responses**: Context-aware emotional support
- **Automatic Scheduling**: Creates calendar events from natural speech
- **Google Calendar Integration**: Seamless event management
- **Text-to-Speech**: Calming voice responses with fallback options

### Phase 2 (Planned)
- Schedule optimization based on workload analysis
- Intelligent feedback on realistic time management
- Family coordination features

### Phase 3 (Future)
- Family or Social group scheduling
- Advanced sentiment analysis
- Personalized stress management insights

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- OpenAI API key
- Google Cloud project with Calendar API enabled
- Google OAuth 2.0 Client ID

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd clearmind-ai
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

4. **Configure environment variables**

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# OpenAI API Key (required)
OPENAI_API_KEY=sk-proj-your-key-here

# Google OAuth Client ID (required for calendar features)
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# API Base URL
REACT_APP_API_BASE_URL=http://localhost:5001/api

# Server Port
PORT=5001
```

### Getting Your API Keys

#### OpenAI API Key
1. Go to [platform.openai.com](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new secret key
5. Copy and paste into your `.env` file

#### Google OAuth Client ID
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins: `http://localhost:3000`
7. Copy the Client ID into your `.env` file

### Running the Application

**Development mode (recommended):**

Terminal 1 - Start backend:
```bash
cd server
npm start
```

Terminal 2 - Start frontend:
```bash
npm start
```

The app will open at `http://localhost:3000`

**Production build:**
```bash
npm run build
cd server
npm start
# Serve the built files
```

## 🏗️ Architecture

### Frontend (React)
```
src/
├── components/             # UI components
│   ├── Header.js           # App header with controls
│   ├── MessageList.js      # Chat interface
│   ├── InputArea.js        # Text/voice input
│   ├── CalendarView.js     # Calendar display
│   └── SettingsPanel.js    # Configuration panel
├── services/               # API integrations
│   ├── speechService.js    # Backend communication
│   ├── ttsService.js       # Text-to-speech
│   └── googleCalendar.js   # Calendar operations
├── hooks/                  # Custom React hooks
│   └── useSpeechToText.js  # Voice input
└── App.js                  # Main application
```

### Backend (Express)
```
server/
├── routes/
│   ├── speech.js          # Speech processing endpoints
│   └── calendar.js        # Calendar webhooks (future)
├── services/
│   └── openaiService.js   # OpenAI integration
└── index.js               # Server entry point
```

## 🔄 User Flow

```
User speaks/types → Frontend captures input
                          ↓
                   Sends to backend
                          ↓
              AI analyzes intent (GPT-4)
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
       "event"          "vent"            "question"
        ↓                 ↓                  ↓
Extract calendar      Generate           Generate
  event data           empathy            advice
        ↓                 ↓                 ↓
        └─────────────────┴─────────────────┘
                          ↓
                  Return response + TTS
                          ↓
            Display in chat + play audio
                          ↓
              (Auto-create calendar event if detected)
```

## 🎨 Design Decisions

### Why These Technologies?

**React**: Component-based architecture perfect for conversational UI
**Express**: Lightweight backend for API orchestration
**OpenAI GPT-4o-mini**: Best balance of speed, cost, and quality for intent detection
**Browser Speech Recognition**: Free, instant, no API calls needed
**Google Calendar API**: Direct integration with users' existing calendars

### Key Architectural Choices

1. **Intent-First Processing**: Every input is classified before action
2. **Graceful Fallbacks**: Browser TTS if OpenAI rate limited
3. **Security-First**: No API keys in frontend code
4. **Conversation Context**: Last 10 messages sent for coherent responses
5. **Client-Side Calendar**: OAuth handled in browser for better UX

## 🔒 Security Notes

**NEVER commit your `.env` file to version control!**

The `.gitignore` file is configured to exclude:
- `.env` and all environment files
- `node_modules`
- API keys and credentials
- Build artifacts

## 📊 Metrics & Success Criteria

### Phase 1 Metrics
- **Time Saved**: Avg. time to create an event (target: <30 seconds)
- **Event Accuracy**: Correctly extracted event data (target: >85%)
- **Active Usage**: Daily active sessions per user
- **Empathy Score**: User satisfaction with emotional responses

## 🐛 Troubleshooting

### "API not configured" warning
- Ensure `.env` file exists in root directory
- Check that `REACT_APP_API_BASE_URL` is set
- Restart the development server

### Speech recognition not working
- Check browser compatibility (Chrome, Edge work best)
- Ensure microphone permissions are granted
- Try refreshing the page

### Calendar not connecting
- Verify Google OAuth Client ID is correct
- Check authorized origins in Google Cloud Console
- Ensure Calendar API is enabled in your project

### TTS not playing
- Check browser console for rate limit messages
- Will automatically fall back to browser TTS
- Check that OpenAI API key has credits

## 🤝 Contributing

This is a course project for CS 5342 at Cornell Tech. 

Team 92:
- Yi Lu
- Amanda Lu
- Raleigh Froeber
- Satya Prianggono

## 📝 License

Private - Cornell Tech Course Project

## 🙏 Acknowledgments

Built for the Sandwich Generation - the 23% of U.S. adults who deserve better tools to manage their complex lives.

---

**Need help?** Check the troubleshooting section or review the inline code comments.
