# Gantt Chart Generator - Web Service

Deploy this AI-powered Gantt chart generator as a web service on Railway.

## Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## Setup Instructions

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Gantt Chart Generator"
   git branch -M main
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Railway will auto-detect and deploy!

## Environment Variables

Set these in Railway dashboard:

- `OPENAI_API_KEY` - Your OpenAI API key (for AI generation)
- `PORT` - Railway sets this automatically

## How It Works

This converts the VS Code extension into a web API:
- POST endpoint accepts instructions and documents
- AI generates Gantt chart structure
- Returns HTML or JSON
- No local installation needed!

## API Endpoints

### Generate Chart
```
POST /api/generate
Content-Type: application/json

{
  "instructions": "Create an 8-week project...",
  "documents": ["document content..."],
  "format": "html" | "json"
}
```

### Health Check
```
GET /health
```

## Local Development (with admin rights elsewhere)

```bash
npm install
npm run dev
```

## Tech Stack

- Node.js + Express (web server)
- TypeScript
- OpenAI API (instead of Copilot)
- Railway (deployment platform)
