# ReEngage AI - Deployment Checklist

## ✅ Pre-Deployment Setup

### 1. Create Whop App
- [ ] Go to [Whop Developer Dashboard](https://dev.whop.com/dashboard)
- [ ] Create a new app
- [ ] Copy the following values:
  - [ ] App ID
  - [ ] App API Key
  - [ ] Company ID (from your Whop community)
  - [ ] Agent User ID (create a bot user if needed)

### 2. Set Up Supabase
- [ ] Create a new project on [Supabase](https://supabase.com)
- [ ] Run the SQL schema (see below)
- [ ] Copy the following values:
  - [ ] Project URL
  - [ ] Anon/Public Key

**SQL Schema:**
```sql
CREATE TABLE member_activity (
  user_id TEXT NOT NULL,
  company_id TEXT NOT NULL,
  last_active_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, company_id)
);

CREATE INDEX idx_member_activity_last_active ON member_activity(last_active_at);
CREATE INDEX idx_member_activity_status ON member_activity(status);
```

### 3. Generate Secrets
- [ ] Generate a random CRON_SECRET (use: `openssl rand -hex 32`)

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - ReEngage AI"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. Deploy to Vercel
- [ ] Go to [Vercel](https://vercel.com/new)
- [ ] Import your GitHub repository
- [ ] Add environment variables (see below)
- [ ] Deploy

**Environment Variables for Vercel:**
```
WHOP_API_KEY=your_whop_api_key
WHOP_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_WHOP_AGENT_USER_ID=your_agent_user_id
NEXT_PUBLIC_WHOP_APP_ID=your_app_id
NEXT_PUBLIC_WHOP_COMPANY_ID=your_company_id
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
INACTIVITY_THRESHOLD_DAYS=14
CRON_SECRET=your_random_cron_secret
```

**Note:** `OPENAI_API_KEY` and `OPENAI_BASE_URL` are already set in the Manus environment.

### 3. Configure Whop App
- [ ] Go back to Whop Developer Dashboard
- [ ] Update "Hosting" settings:
  - [ ] Base URL: `https://your-app.vercel.app`
  - [ ] App Path: `/experiences/[experienceId]`
  - [ ] Dashboard Path: `/dashboard/[companyId]`

### 4. Test the App
- [ ] Visit your Whop community
- [ ] Add ReEngage AI from the Tools section
- [ ] Visit the experience page to trigger activity tracking
- [ ] Visit the dashboard to see stats

### 5. Test the Cron Job (Optional)
```bash
curl -X GET https://your-app.vercel.app/api/cron/daily \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📊 Post-Deployment

### Monitor Performance
- [ ] Check Vercel logs for errors
- [ ] Monitor Supabase database for activity records
- [ ] Verify cron job runs daily (check Vercel cron logs)

### Customize Settings
- [ ] Adjust `INACTIVITY_THRESHOLD_DAYS` if needed
- [ ] Customize AI prompts in `lib/ai.ts`
- [ ] Update UI styling to match your brand

## 🎯 Submit to #BuiltwithManus

- [ ] Take screenshots of:
  - [ ] Dashboard showing stats
  - [ ] Experience page
  - [ ] Example AI-generated message
- [ ] Record a demo video
- [ ] Submit to [Typeform](https://form.typeform.com/to/VL2JhE1X)

## 🐛 Troubleshooting

**Cron job not running:**
- Verify `CRON_SECRET` is set in Vercel
- Check `vercel.json` exists with cron configuration
- Review Vercel function logs

**Activity not tracking:**
- Check browser console for errors
- Verify Supabase credentials
- Ensure table schema is correct

**AI messages not sending:**
- Verify Whop API key has notification permissions
- Check Vercel function logs for errors
- Test AI generation locally first

## 📝 Notes

- The cron job runs daily at midnight UTC
- Members are marked "at-risk" after 14 days of inactivity (configurable)
- AI messages are generated using GPT-4.1-mini via Manus
- All costs are covered by Manus's 1 trillion free tokens

---

**Built by:** Andreas Michailidis (Drewskii)
**Campaign:** #BuiltwithManus
**Date:** October 2025

