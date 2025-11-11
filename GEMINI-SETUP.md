# 🆓 Get Free Google Gemini API Key

Google Gemini is **FREE** and works great for Gantt chart generation!

## Step 1: Get Your API Key

1. Go to **https://makersuite.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Select **"Create API key in new project"** (or use existing)
5. Copy the API key

## Step 2: Add to Railway

1. Go to **https://railway.app/dashboard**
2. Open your **"Research-Checker"** project
3. Click your service
4. Go to **"Variables"** tab
5. Click **"+ New Variable"**
6. Enter:
   - **Variable Name**: `GEMINI_API_KEY`
   - **Value**: Paste your Gemini API key
7. Click **"Add"**

Railway will automatically restart.

## Step 3: Test It!

Visit your Railway URL and generate a chart - it should work now! 🎉

## Why Gemini?

✅ **FREE** - No credit card required
✅ **Generous limits** - 60 requests per minute
✅ **Powerful** - Gemini Pro is excellent for this task
✅ **No billing** - Won't charge you unexpectedly

## Gemini vs OpenAI

| Feature | Google Gemini | OpenAI |
|---------|---------------|---------|
| Cost | **FREE** ✅ | $0.01-0.03 per chart |
| Sign up | Google account | Credit card required |
| Quality | Excellent | Excellent |
| Rate limits | 60/min | Varies by plan |

## Troubleshooting

**"API key not valid"**
- Make sure you copied the entire key
- No spaces before/after
- Try creating a new key

**Still getting errors?**
- Check Railway logs in Deployments tab
- Verify variable name is exactly: `GEMINI_API_KEY`
- Wait 30 seconds for Railway to restart

## Need OpenAI Instead?

The code supports both! Just set `OPENAI_API_KEY` instead of `GEMINI_API_KEY`.

The app will automatically use whichever key you provide (Gemini checked first).
