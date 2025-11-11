# 🚀 Deploy to Railway - Step by Step

Your AI Gantt Chart Generator is ready to deploy! Follow these steps:

## ✅ Repository is Ready

Your local git repository has been initialized and committed with all files.

## Step 1: Create GitHub Repository

1. Go to **https://github.com/new**
2. Repository name: `ai-gantt-chart-generator` (or your choice)
3. Description: `AI-powered Gantt chart generator with Railway deployment`
4. Keep it **Public** or **Private** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license
6. Click **"Create repository"**

## Step 2: Push to GitHub

GitHub will show you commands. Run these in your terminal:

```powershell
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values.

## Step 3: Get OpenAI API Key

You need an OpenAI API key for the AI functionality:

1. Go to **https://platform.openai.com/api-keys**
2. Sign in or create account
3. Click **"Create new secret key"**
4. Copy the key (starts with `sk-`)
5. **Save it securely** - you'll need it for Railway

## Step 4: Deploy to Railway

### Option A: Deploy Button (Easiest)

1. Go to your GitHub repository
2. Click **"Deploy to Railway"** button in README
3. Sign in with GitHub
4. Railway will auto-detect the project

### Option B: Manual Deploy

1. Go to **https://railway.app**
2. Click **"Start a New Project"**
3. Choose **"Deploy from GitHub repo"**
4. Sign in with GitHub if needed
5. Select your `ai-gantt-chart-generator` repository
6. Railway will automatically detect it's a Node.js project

## Step 5: Configure Environment Variables

After Railway creates your project:

1. Click on your project
2. Go to **"Variables"** tab
3. Click **"+ New Variable"**
4. Add:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI key from Step 3
5. Click **"Add"**

Railway will automatically restart your service.

## Step 6: Get Your URL

1. Go to **"Settings"** tab
2. Under **"Domains"**, Railway auto-generates a URL like:
   ```
   https://your-app-name.up.railway.app
   ```
3. Click to copy or visit your URL!

## Step 7: Test Your Service

Visit your Railway URL. You should see:
- 🎯 Web interface for generating charts
- Input box for instructions
- "Generate Chart" button

**Try it:**
```
Instructions: Create an 8-week software project with planning, 
design, development, and testing phases
```

Click "Generate Chart" and watch the AI create your chart! 🎉

## API Usage

Your service also has an API endpoint:

```bash
curl -X POST https://your-app.up.railway.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "instructions": "Create a 10-week project...",
    "format": "html"
  }'
```

## Troubleshooting

### "Application Error" on Railway

Check the logs:
1. Go to Railway dashboard
2. Click your project
3. Click **"Deployments"**
4. Click latest deployment
5. Check logs for errors

Common issues:
- Missing `OPENAI_API_KEY` → Add in Variables tab
- Build failed → Check package.json syntax
- Port issues → Railway sets PORT automatically

### OpenAI API Errors

- **401 Unauthorized**: Check your API key
- **429 Rate Limit**: Upgrade OpenAI plan or wait
- **Timeout**: Try shorter instructions

### Chart Not Generating

- Check browser console (F12) for errors
- Verify API key is set in Railway
- Check Railway logs for server errors

## Cost Estimate

**Railway**:
- Free tier: $5 credit/month
- Hobby plan: $5/month
- Your usage: Likely free tier is enough for testing

**OpenAI**:
- GPT-4o: ~$0.01-0.03 per chart generation
- 100 charts ≈ $1-3
- Monitor at platform.openai.com/usage

## What's Deployed

Your Railway service includes:
- ✅ Web UI for generating charts
- ✅ REST API endpoint
- ✅ AI-powered generation (OpenAI)
- ✅ Your exact template styling
- ✅ Document analysis support
- ✅ JSON and HTML output

## Next Steps

### Share Your App

Give your Railway URL to anyone:
```
https://your-app.up.railway.app
```

No installation needed - just open and use!

### Custom Domain (Optional)

In Railway:
1. Go to **Settings** → **Domains**
2. Click **"Add Custom Domain"**
3. Enter your domain (e.g., `gantt.yourdomain.com`)
4. Follow DNS setup instructions

### Monitor Usage

- **Railway Dashboard**: Check deployments, logs, usage
- **OpenAI Dashboard**: Monitor API usage and costs

## Commands Reference

### Push Updates to Railway

After making code changes:

```powershell
git add .
git commit -m "Your update message"
git push
```

Railway automatically redeploys!

### Local Testing (if you get admin rights later)

```powershell
npm install
npm run dev
```

Visit http://localhost:3000

## Support

- **Railway Docs**: https://docs.railway.app
- **OpenAI Docs**: https://platform.openai.com/docs
- **Your Code**: Check ARCHITECTURE.md for details

---

## Quick Summary

```
1. Create GitHub repo
2. Push code: git push
3. Sign up on Railway
4. Deploy from GitHub
5. Add OPENAI_API_KEY
6. Get your URL
7. Generate charts! 🎉
```

Your AI Gantt Chart Generator is now accessible to anyone with the URL!

No VS Code needed, no local installation, just pure web-based chart generation. 🚀
