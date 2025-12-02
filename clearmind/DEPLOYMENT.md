# Deployment Guide

## Quick Deploy Checklist

- [ ] Set up production environment variables
- [ ] Update OAuth redirect URIs in Google Cloud Console
- [ ] Configure CORS for production domain
- [ ] Build optimized frontend
- [ ] Set up backend hosting
- [ ] Configure SSL/HTTPS
- [ ] Test all features in production

## Environment Setup

### Production Environment Variables

Create a `.env.production` file:

```env
# Backend
OPENAI_API_KEY=your_production_openai_key
PORT=5001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Frontend (must be built into app)
REACT_APP_GOOGLE_CLIENT_ID=your_production_google_client_id
REACT_APP_API_BASE_URL=https://api.your-domain.com
```

## Hosting Options

### Option 1: Vercel (Recommended for Frontend)

**Frontend Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Environment Variables in Vercel:**
- Add `REACT_APP_GOOGLE_CLIENT_ID` in Vercel dashboard
- Add `REACT_APP_API_BASE_URL` pointing to your backend

### Option 2: Railway (Recommended for Backend)

**Backend Deployment:**
```bash
# In server directory
railway login
railway init
railway up
```

**Environment Variables in Railway:**
- Add `OPENAI_API_KEY`
- Add `FRONTEND_URL` (your Vercel URL)
- Add `PORT` (Railway provides this automatically)

### Option 3: AWS (Full Stack)

**Frontend (S3 + CloudFront):**
```bash
npm run build
aws s3 sync build/ s3://your-bucket-name
```

**Backend (Elastic Beanstalk):**
```bash
cd server
eb init
eb create production
eb deploy
```

### Option 4: Heroku (Simple Full Stack)

**Backend:**
```bash
cd server
heroku create clearmind-api
heroku config:set OPENAI_API_KEY=your_key
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
git push heroku main
```

**Frontend:**
Deploy to Vercel (see Option 1)

## Google OAuth Configuration

### Update Authorized Origins

In [Google Cloud Console](https://console.cloud.google.com/):

1. Go to APIs & Services → Credentials
2. Click your OAuth 2.0 Client ID
3. Add Authorized JavaScript origins:
   - `https://your-production-domain.com`
   - `https://your-staging-domain.com` (if applicable)
4. Add Authorized redirect URIs if needed

### Update in Code

No code changes needed! OAuth is handled client-side with the Client ID from environment variables.

## CORS Configuration

Update `server/index.js` CORS settings:

```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

## Build Process

### Frontend Build
```bash
# Create optimized production build
npm run build

# Test production build locally
npx serve -s build
```

### Backend Build
```bash
cd server
# No build needed for Node.js, just ensure:
# - package.json has correct "start" script
# - Environment variables are set
# - Dependencies are installed
npm install --production
```

## SSL/HTTPS

**Important:** Google OAuth requires HTTPS in production.

Most hosting providers (Vercel, Railway, Heroku) provide SSL automatically.

For custom hosting:
- Use Let's Encrypt for free SSL certificates
- Configure nginx/Apache as reverse proxy
- Ensure all API calls use HTTPS URLs

## Health Checks

Both frontend and backend should have health check endpoints:

**Backend Health Check:**
```
GET https://api.your-domain.com/api/health
```

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-02T..."
}
```

## Monitoring

### Recommended Tools
- **Backend**: Sentry for error tracking
- **Frontend**: Google Analytics for usage
- **API**: OpenAI usage dashboard
- **Uptime**: UptimeRobot or Pingdom

### Key Metrics to Track
1. API response times
2. OpenAI token usage (cost monitoring)
3. Calendar integration success rate
4. User session duration
5. Intent detection accuracy

## Rollback Plan

### Frontend Rollback
```bash
# Vercel
vercel rollback

# Manual
git revert <commit-hash>
npm run build
vercel --prod
```

### Backend Rollback
```bash
# Railway
railway rollback

# Heroku
heroku rollback

# Manual
git revert <commit-hash>
git push heroku main
```

## Post-Deployment Testing

### Critical Paths to Test
1. [ ] Voice input works
2. [ ] Text input works
3. [ ] Intent detection returns correct classifications
4. [ ] Calendar connection works
5. [ ] Event creation works
6. [ ] TTS plays audio
7. [ ] Settings panel loads
8. [ ] Calendar view displays events

### Test Scenarios
```
Test 1: Empathetic Response
Input: "I'm so overwhelmed today"
Expected: Empathetic message, no calendar event

Test 2: Event Creation
Input: "Schedule a meeting tomorrow at 3pm"
Expected: Event created, confirmation message

Test 3: Question
Input: "How should I organize my dad's medications?"
Expected: Helpful advice, no calendar event
```

## Common Issues

### Issue: CORS errors in production
**Solution:** Ensure `FRONTEND_URL` env var is set correctly in backend

### Issue: Google OAuth fails
**Solution:** Check authorized origins in Google Cloud Console

### Issue: OpenAI rate limits
**Solution:** Upgrade to paid tier or implement request queuing

### Issue: TTS not playing
**Solution:** Ensure audio files are served with correct MIME types

## Cost Estimates

### OpenAI Costs (Monthly)
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **TTS**: ~$15 per 1M characters
- Estimated: $20-50/month for 100 active users

### Hosting Costs
- **Vercel (Frontend)**: Free tier sufficient for MVP
- **Railway (Backend)**: $5/month starter plan
- **Google Cloud**: Free tier sufficient for OAuth
- Total: ~$5-15/month

## Security Checklist

- [ ] All API keys in environment variables
- [ ] `.env` files not in version control
- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting on API endpoints
- [ ] Input sanitization on backend
- [ ] OAuth tokens stored securely
- [ ] Regular dependency updates

## Support & Maintenance

### Update Schedule
- **Security patches**: Immediately
- **Dependencies**: Monthly
- **Feature releases**: Bi-weekly
- **OpenAI model updates**: Quarterly review

### Backup Strategy
- User data: Stored in Google Calendar (user's account)
- Conversation history: Not persisted (privacy by design)
- Configuration: Version controlled in Git

---

**Questions?** Refer to the main README.md or check inline code documentation.
