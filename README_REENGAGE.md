# ReEngage AI

**Automated Member Retention for Whop Communities**

ReEngage AI is a Whop app that automatically identifies at-risk community members and sends them personalized, AI-generated re-engagement messages. Built for the #BuiltwithManus campaign.

## 🎯 What It Does

- **Tracks Member Activity:** Automatically logs when members interact with your community
- **Identifies At-Risk Members:** Detects members who haven't been active for 14+ days
- **Generates AI Messages:** Creates personalized re-engagement messages using Manus LLM
- **Sends Automatically:** Delivers messages via Whop notifications without manual work

## 🚀 Quick Start

### Prerequisites

1. A Whop account and app created on the [Whop Developer Dashboard](https://dev.whop.com/dashboard)
2. A Supabase account and project ([supabase.com](https://supabase.com))
3. Node.js 20+ and pnpm installed

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up Supabase database:**
   
   Create a table named `member_activity` with this SQL:
   
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

3. **Configure environment variables:**
   
   Copy `.env.local.example` to `.env.local` and fill in your values:
   
   ```bash
   cp .env.local.example .env.local
   ```
   
   Required variables:
   - `WHOP_API_KEY` - From Whop Developer Dashboard
   - `WHOP_WEBHOOK_SECRET` - From Whop webhook settings
   - `NEXT_PUBLIC_WHOP_APP_ID` - Your Whop app ID
   - `NEXT_PUBLIC_WHOP_COMPANY_ID` - Your Whop company ID
   - `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project settings
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase project settings
   - `CRON_SECRET` - Generate a random secret for cron job authentication

4. **Run locally:**
   ```bash
   pnpm dev
   ```

### Whop App Configuration

In your Whop Developer Dashboard, configure:

- **Base URL:** Your deployment URL (e.g., `https://reengage-ai.vercel.app`)
- **App Path:** `/experiences/[experienceId]`
- **Dashboard Path:** `/dashboard/[companyId]`

## 📦 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add all environment variables from `.env.local`
4. Deploy

Vercel will automatically:
- Build and deploy your app
- Set up the daily cron job (runs at midnight UTC)
- Enable serverless functions

### Post-Deployment

1. Update the **Base URL** in your Whop app settings to your Vercel URL
2. Test the cron job by visiting: `https://your-app.vercel.app/api/cron/daily` (with Authorization header)

## 🏗️ Architecture

```
┌─────────────────┐
│  Member visits  │
│   Experience    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Activity Tracker│──────► Supabase
│  (Client-side)  │        (member_activity table)
└─────────────────┘
         
         Daily at 00:00 UTC
         │
         ▼
┌─────────────────┐
│   Cron Job      │
│  /api/cron/daily│
└────────┬────────┘
         │
         ├──► Fetch inactive members from Supabase
         │
         ├──► Generate AI messages via Manus LLM
         │
         └──► Send notifications via Whop API
```

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **AI:** Manus LLM (GPT-4.1-mini)
- **Deployment:** Vercel
- **Styling:** Tailwind CSS

## 📊 API Routes

- `POST /api/activity` - Track member activity
- `GET /api/cron/daily` - Daily cron job for re-engagement (protected)

## 🎨 Customization

### Adjust Inactivity Threshold

Edit `.env.local`:
```
INACTIVITY_THRESHOLD_DAYS=14
```

### Customize AI Messages

Edit `lib/ai.ts` to change the prompt or model parameters.

### Change Cron Schedule

Edit `vercel.json` to adjust when the job runs:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily",
      "schedule": "0 0 * * *"  // Daily at midnight
    }
  ]
}
```

## 🐛 Troubleshooting

### Cron job not running

- Ensure `CRON_SECRET` is set in Vercel environment variables
- Check Vercel logs for errors
- Verify the cron job is configured in `vercel.json`

### Activity not being tracked

- Check browser console for errors
- Verify Supabase URL and anon key are correct
- Ensure the `member_activity` table exists

### AI messages not sending

- Verify `OPENAI_API_KEY` is set (should be automatic in Manus environment)
- Check Whop API key has notification permissions
- Review Vercel function logs

## 📝 License

MIT

## 🙏 Credits

Built by Andreas Michailidis (Drewskii) for the #BuiltwithManus campaign.

Powered by:
- [Whop](https://whop.com) - Community platform
- [Manus](https://manus.im) - AI agent platform
- [Supabase](https://supabase.com) - Database
- [Vercel](https://vercel.com) - Deployment

