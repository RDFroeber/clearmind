# Changelog

## [Refactored] - 2024-12-02

### 🔒 Security Fixes
- **CRITICAL**: Removed hardcoded OpenAI API key from frontend code
- Moved all sensitive credentials to environment variables
- Added `.env.example` template for safe onboarding
- Updated `.gitignore` to prevent credential leaks

### 🐛 Bug Fixes
- Fixed invalid OpenAI model name (`gpt-5-nano` → `gpt-4o-mini`)
- Corrected incomplete event creation flow
- Fixed conversation context not being passed to AI
- Resolved TTS rate limiting issues with proper fallback

### 🧹 Code Cleanup
- Removed unused files:
  - `server/routes/whisper.js`
  - `server/services/geminiService.js`
  - `src/services/whisper.js`
  - `src/hooks/useChat.js`
  - `src/components/RecordButton.js`
- Consolidated duplicate functionality
- Removed commented-out code

### ✨ New Features
- **Smart Intent Detection**: AI now determines if user needs empathy vs. event scheduling
- **Better Error Handling**: Graceful fallbacks throughout the application
- **Conversation Context**: Maintains last 10 messages for coherent responses
- **Intent Indicators**: Visual badges showing AI's understanding (event/vent/question)
- **Improved TTS**: Better rate limiting and browser fallback

### 🏗️ Architecture Improvements
- Clear separation of concerns (services vs. components)
- Unified API communication layer
- Better state management in React
- Consistent error handling patterns
- Environment-based configuration

### 📚 Documentation
- Comprehensive README with setup instructions
- API key acquisition guides
- Troubleshooting section
- Architecture diagrams in code
- Inline code comments for complex logic

### 🎨 UI/UX Enhancements
- Cleaner settings panel
- Better visual feedback for recording state
- Intent badges on assistant messages
- Improved mobile responsiveness
- Better loading states

## What Was Removed

### Files Deleted
1. **Gemini Service** - Project standardized on OpenAI
2. **Whisper Route** - Using browser speech recognition instead
3. **useChat Hook** - Functionality moved to App.js
4. **RecordButton Component** - Integrated into InputArea

### Why These Were Removed
- **Gemini**: Simplified to single AI provider (OpenAI)
- **Whisper**: Browser API is free and instant vs. paid API calls
- **useChat**: Over-abstraction for current needs
- **RecordButton**: Redundant with InputArea controls

## Migration Guide

### From Original to Refactored

1. **Environment Variables**
   ```bash
   # Old (hardcoded in code)
   const OPENAI_API_KEY = 'sk-proj-...'
   
   # New (in .env file)
   OPENAI_API_KEY=sk-proj-...
   ```

2. **Model Names**
   ```javascript
   // Old
   model: 'gpt-5-nano'  // Doesn't exist!
   
   // New
   model: 'gpt-4o-mini'  // Real model
   ```

3. **Message Processing**
   ```javascript
   // Old - unclear flow
   sendMessage() → sometimes creates event?
   
   // New - explicit intent detection
   sendMessage() → analyzeIntent() → 
     ↓
   event: createCalendarEvent()
   vent: generateEmpathy()
   question: provideAdvice()
   ```

## Next Steps

### Immediate Priorities
1. User testing with actual Sandwich Generation members
2. Gather metrics on intent detection accuracy
3. Refine empathy prompts based on feedback

### Phase 2 Features
1. Schedule optimization algorithms
2. Workload balance warnings
3. Family member notification system

### Phase 3 Features
1. Sentiment analysis dashboard
2. Family group coordination
3. Stress pattern insights
