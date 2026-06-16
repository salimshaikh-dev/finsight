# FinSight — Production Deployment Guide

## Overview
This guide covers deploying FinSight to production on Railway (backend) and Vercel (frontend).

**Stack**
- Backend: Python 3.11, FastAPI, deployed to Railway
- Frontend: React 18, TypeScript, Vite, deployed to Vercel
- AI: Anthropic Claude API

---

## Prerequisites

### Accounts & API Keys
1. **Railway account** — https://railway.app (free tier includes 5GB/month)
2. **Vercel account** — https://vercel.com (free tier sufficient for this project)
3. **Anthropic API key** — https://console.anthropic.com/account/keys (claude-sonnet-4-20250514)
4. **GitHub account** with this repo pushed

---

## Deployment Steps

### Step 1: Deploy Backend to Railway

1. Push code to GitHub repo:
   ```bash
   git push origin main
   ```

2. Go to https://railway.app and sign in

3. Click **New Project** → **Deploy from GitHub**
   - Select your GitHub repo
   - Choose branch (typically `main`)

4. Configure Railway:
   - **Root Directory**: `/backend`
   - **Dockerfile**: Automatically detected at `backend/Dockerfile`
   - **Port**: `8000` (configured in Dockerfile CMD)

5. Set Environment Variables:
   - `ANTHROPIC_API_KEY`: Paste your Anthropic API key
   - `CORS_ORIGINS`: `["https://your-frontend.vercel.app"]` (replace with actual Vercel URL after frontend deploy)
   - `LOG_LEVEL`: `INFO` (optional)
   - `MAX_FILE_SIZE_MB`: `10` (optional)

6. Click **Deploy** and wait for the build to complete.

7. **Note Railway URL** once deployed: `https://finsight-backend-[random].railway.app` (or your custom domain)

---

### Step 2: Deploy Frontend to Vercel

1. Go to https://vercel.com and sign in

2. Click **Add New...** → **Project**
   - Import your GitHub repo

3. Configure Project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Set Environment Variables:
   - `VITE_API_URL`: Paste your Railway backend URL from Step 1
   - Example: `https://finsight-backend-[random].railway.app`

5. Click **Deploy** and wait for the build to complete.

6. **Note Vercel URL**: `https://your-project.vercel.app`

---

### Step 3: Update Backend CORS

After the frontend is deployed, update the Railway backend environment variable:
- `CORS_ORIGINS`: `["https://your-project.vercel.app"]`

Railway will automatically redeploy with the new config.

---

## Verification

1. Open your frontend URL in a browser: `https://your-project.vercel.app`

2. Upload a PDF bank statement

3. Confirm the UI shows:
   - Loading spinner while Claude analyzes
   - Transaction dashboard with spending breakdown
   - "No data is stored or logged" footer message

4. If you see a 502 error:
   - Check Railway logs: Railway Dashboard → Logs tab
   - Verify `ANTHROPIC_API_KEY` is set correctly
   - Confirm `CORS_ORIGINS` includes the frontend URL

---

## Environment Variables Reference

### Backend (Railway)
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | ✅ | Create at https://console.anthropic.com |
| `CORS_ORIGINS` | `["https://yourapp.vercel.app"]` | ✅ | JSON array format |
| `LOG_LEVEL` | `INFO` | ❌ | DEBUG, INFO, WARNING, ERROR |
| `MAX_FILE_SIZE_MB` | `10` | ❌ | Maximum PDF upload size |

### Frontend (Vercel)
| Variable | Example | Required | Notes |
|----------|---------|----------|-------|
| `VITE_API_URL` | `https://backend.railway.app` | ✅ | Backend URL from Railway |

---

## Troubleshooting

### 502 Bad Gateway on PDF upload
**Cause**: Backend service error or malformed request.
- Check Railway logs for Claude API errors
- Verify `ANTHROPIC_API_KEY` is valid
- Ensure PDF is valid and text-based (not scanned/image-only)

### CORS error in browser console
**Cause**: Frontend URL not in backend's `CORS_ORIGINS`.
- Update Railway env var: `CORS_ORIGINS` → `["https://your-vercel-url"]`
- Railway will redeploy automatically

### Blank frontend page
**Cause**: `VITE_API_URL` not set or incorrect.
- Verify Vercel env var is set to your Railway backend URL
- Trigger a redeploy: Vercel Dashboard → Deployments → Redeploy

### Claude API rate limit (429)
- Upgrade your Anthropic plan or retry after 60 seconds
- Production should implement a job queue (Redis + Celery) for scale

---

## Monitoring

### Railway Logs
- Dashboard → Logs tab
- Real-time logs from backend server

### Vercel Logs
- Dashboard → Deployments → Logs tab
- Build and runtime logs

### Health Check
```bash
# Test backend health
curl https://your-backend.railway.app/health

# Expected response:
# {"status":"ok","version":"1.0.0","model":"claude-sonnet-4-20250514"}
```

---

## Cost Estimates (as of Jun 2024)

### Railway (Backend)
- Free tier: 5GB/month, perfect for prototyping
- ~$5-10/month for production with 1-2 workers

### Vercel (Frontend)
- Free tier: sufficient for this project
- Automatic scaling, no action needed

### Anthropic Claude API
- Pay-per-token model (~$0.003 per 1K input tokens)
- ~$0.10-1.00 per typical bank statement analysis
- Adjust with volume

---

## Next Steps

### Scale to Production
1. Add a job queue: Celery + Redis for async PDF processing
2. Implement caching by file hash (Redis)
3. Fine-tune smaller Claude model (10x cost reduction)
4. Add request rate limiting

### Security Hardening
1. Enable HTTPS (automatic on Railway + Vercel)
2. Add API authentication (JWT tokens or API keys)
3. Implement database logging for audit trail
4. Add data retention policy (auto-delete after N days)

### Monitoring & Observability
1. Set up error tracking: Sentry or LogRocket
2. Add performance monitoring: Datadog or New Relic
3. Create alerting for API errors and rate limits

---

## Support

For issues:
1. Check Railway logs: Railway Dashboard → Logs
2. Check Vercel logs: Vercel Dashboard → Deployments
3. Test backend health: `curl https://your-backend.railway.app/health`
4. Verify ANTHROPIC_API_KEY and CORS_ORIGINS are set

**Built with Claude · Anthropic**
