# 🚂 Railway Deployment Guide for ClearMind AI

## Prerequisites Checklist

Before you start, make sure you have:

- [ ] GitHub account
- [ ] Railway account (sign up at railway.app)
- [ ] Your code pushed to GitHub
- [ ] All API keys ready:
  - [ ] `OPENAI_API_KEY`
  - [ ] `GOOGLE_CLIENT_ID`
  - [ ] `GOOGLE_CLIENT_SECRET`
  - [ ] `ANTHROPIC_API_KEY` (if using)

---

## Step 1: Push Your Code to GitHub (5 minutes)

If you haven't already:

```bash
cd /path/to/your/app
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/clearmind-ai.git
git push -u origin main
```

---

## Step 2: Create Railway Project (2 minutes)

1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub
5. Select your `clearmind-ai` repository

---

## Step 3: Deploy Backend Server (5 minutes)

### 3.1 Create Backend Service

1. In your Railway project, click **"+ New"**
2. Select **"GitHub Repo"**
3. Choose your repo again
4. Railway will detect both frontend and backend

### 3.2 Configure Backend Service

1. Click on the backend service
2. Go to **Settings** → **Service Name**: `clearmind-backend`
3. **Root Directory**: Set to `server`
4. **Start Command**: `npm start`
5. **Port**: Railway will auto-detect port 5001

### 3.3 Add Backend Environment Variables

Go to **Variables** tab and add:

```
NODE_ENV=production
PORT=5001
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
ANTHROPIC_API_KEY=your_anthropic_key_here (optional)
FRONTEND_URL=${FRONTEND_URL}
```

**Note:** We'll update `FRONTEND_URL` after deploying the frontend.

### 3.4 Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment (2-3 minutes)
3. Once deployed, copy the backend URL (e.g., `https://clearmind-backend-production.up.railway.app`)

---

## Step 4: Deploy Frontend (5 minutes)

### 4.1 Create Frontend Service

1. Click **"+ New"** in your project
2. Select **"GitHub Repo"** (same repo)
3. This will be the frontend service

### 4.2 Configure Frontend Service

1. Click on the frontend service
2. Go to **Settings** → **Service Name**: `clearmind-frontend`
3. **Root Directory**: Leave as `/` (root)
4. **Build Command**: `npm run build`
5. **Start Command**: `npx serve -s build -l $PORT`

### 4.3 Add Frontend Environment Variables

Go to **Variables** tab and add:

```
REACT_APP_API_BASE_URL=https://your-backend-url-from-step-3.up.railway.app/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
NODE_ENV=production
```

**Important:** Replace `your-backend-url-from-step-3` with the actual backend URL from Step 3.4

### 4.4 Install `serve` Package

Railway needs `serve` to host the React build. Add it to your root `package.json`:

**Option A: Add to dependencies locally, then push:**
```bash
cd /path/to/your/app
npm install serve --save
git add package.json package-lock.json
git commit -m "Add serve for production"
git push
```

**Option B: Update in Railway dashboard:**
Go to Settings → Custom Build Command:
```
npm install && npm install -g serve && npm run build
```

### 4.5 Deploy Frontend

1. Click **"Deploy"**
2. Wait for deployment (3-5 minutes)
3. Copy the frontend URL (e.g., `https://clearmind-frontend-production.up.railway.app`)

---

## Step 5: Connect Frontend & Backend (2 minutes)

### 5.1 Update Backend CORS

1. Go to **Backend service** → **Variables**
2. Update `FRONTEND_URL` with your frontend URL from Step 4.5:
   ```
   FRONTEND_URL=https://clearmind-frontend-production.up.railway.app
   ```
3. Click **"Redeploy"**

### 5.2 Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Add to **Authorized JavaScript origins**:
   ```
   https://clearmind-frontend-production.up.railway.app
   ```
5. Add to **Authorized redirect URIs**:
   ```
   https://clearmind-frontend-production.up.railway.app
   ```
6. Click **Save**

---

## Step 6: Test Your Deployment (2 minutes)

1. Visit your frontend URL: `https://clearmind-frontend-production.up.railway.app`
2. Test the following:
   - [ ] Sign in with Google
   - [ ] Create an event: "add lunch at 1pm"
   - [ ] View calendar
   - [ ] Test voice input (if enabled)
   - [ ] Test TTS (if enabled)

---

## Troubleshooting

### Issue: "Failed to fetch" or CORS errors

**Solution:**
1. Check that `FRONTEND_URL` in backend matches your actual frontend URL
2. Verify backend is running: Visit `https://your-backend-url.up.railway.app/api/health`
3. Check Railway logs for CORS errors

### Issue: "Google OAuth not working"

**Solution:**
1. Verify `REACT_APP_GOOGLE_CLIENT_ID` matches your Google Console credentials
2. Ensure authorized origins/redirects include your Railway frontend URL
3. Check that you're using HTTPS (Railway provides this automatically)

### Issue: "OpenAI API errors"

**Solution:**
1. Verify `OPENAI_API_KEY` is set correctly in backend variables
2. Check Railway backend logs for API errors
3. Ensure your OpenAI account has credits

### Issue: Build fails on frontend

**Solution:**
1. Make sure `serve` is installed (Step 4.4)
2. Check build logs in Railway dashboard
3. Verify all environment variables are set

### Issue: Backend crashes on startup

**Solution:**
1. Check backend logs in Railway dashboard
2. Verify all required environment variables are set
3. Test locally first: `cd server && npm start`

---

## Environment Variables Summary

### Backend (`clearmind-backend`)
```
NODE_ENV=production
PORT=5001
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
ANTHROPIC_API_KEY=sk-ant-... (optional)
FRONTEND_URL=https://your-frontend.up.railway.app
```

### Frontend (`clearmind-frontend`)
```
REACT_APP_API_BASE_URL=https://your-backend.up.railway.app/api
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NODE_ENV=production
```

---

## Cost Estimate

Railway offers:
- **$5 free credit per month** (hobby plan)
- **Pay-as-you-go** after free credits

Your app should cost approximately:
- **Backend:** ~$2-3/month (if you exceed free tier)
- **Frontend:** ~$1-2/month (if you exceed free tier)
- **Total:** ~$3-5/month (or $0 if within free tier)

**Free tier includes:**
- 500 execution hours per month
- 100 GB bandwidth
- This should be more than enough for personal use!

---

## Custom Domain (Optional)

To use your own domain:

1. In Railway, go to **Settings** → **Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `clearmind.yourdomain.com`)
4. Add the CNAME record to your DNS provider:
   ```
   CNAME clearmind your-app.up.railway.app
   ```
5. Wait for DNS propagation (5-30 minutes)

---

## Monitoring & Logs

### View Logs
1. Click on a service in Railway
2. Go to **Deployments** tab
3. Click on the active deployment
4. View real-time logs

### Monitor Performance
1. Railway dashboard shows:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

---

## Updating Your App

Whenever you push to GitHub:
1. Railway automatically detects changes
2. Builds and deploys the new version
3. Zero-downtime deployment

**Manual redeploy:**
1. Go to service in Railway
2. Click **"Redeploy"**

---

## Alternative: One-Click Templates

If you want even faster deployment, I can create Railway template buttons that deploy everything with one click. Let me know if you'd like that!

---

## Support

If you run into issues:
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway status: https://railway.instatus.com

---

## Next Steps

After successful deployment:
1. ✅ Test all features thoroughly
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring/alerts
4. ✅ Add analytics (optional)
5. ✅ Share with users!

---

**Your app should be live in ~20 minutes from now! 🎉**