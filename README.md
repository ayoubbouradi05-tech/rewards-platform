# RewardHub — CPA & Survey Rewards Web Platform

A production-ready CPA reward web application clone of RewardTask/rewardsurvey.co built with Next.js 15, Supabase (Auth + Database + RLS), and custom dark glassmorphic styling via Tailwind CSS.

---

## Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth (Email & Password Confirmation)
- **Styling**: Tailwind CSS + Custom CSS Variables & Utilities (Deep dark tone, modern glassmorphic look)
- **Deployment**: Vercel ready

---

## Key Features
1. **User Authentication**: Login, Sign up with Email verification, Protected client-side routing, and Admin route restrictions via middleware.
2. **Dashboard**: High-quality UI summarizing Current Balance, Completed Tasks, All-time Earnings, Pending Withdrawals, and a live Recent Activity feed.
3. **Dynamic Offers API Proxy**: Integrates with the Cloudfront Offers feed API. Fetches server-side to prevent exposing your API Key to the browser, appends the user's ID as `s1` (subid), and formats the JSON feed into clear grid-cards.
4. **Postback System**: An endpoint `/api/postback` validating incoming postbacks with a security token. Handles duplicate conversions through 1-hour limits, updates user balance, and inserts rows into `conversions` and `transactions` tables.
5. **Withdrawal System**: Lets members submit USDT (TRC-20) payouts, checks minimum balance ($5), holds the balance pending, and records cashout requests.
6. **Admin Panel**: High-privilege pages to overview total platform stats, inspect user accounts, review postback conversions, and approve or reject payouts (rejection refunds the user balance instantly).

---

## Supabase Database Schema Setup

Create a new Supabase project at [supabase.com](https://supabase.com). Open the **SQL Editor** in your project dashboard and execute the script inside:
👉 `supabase/schema.sql`

This creates:
- `profiles` table (automatically synchronized with Supabase's auth.users table via trigger)
- `conversions` table (tracks postbacks)
- `transactions` table (tracks all credits and debits)
- `withdrawals` table (tracks cashout requests)
- Row Level Security (RLS) policies for secure queries
- Indices on frequently queried fields

---

## Local Development & Environment Configuration

Create a `.env.local` file inside the root directory and copy variables from `.env.local.example`:

```env
# Supabase credentials (from Supabase Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Postback Security Token
POSTBACK_SECRET=your_custom_secure_secret_token

# Offers API Key details
OFFERS_PUBLIC_KEY=b09dbb6ed301a0f8172d
OFFERS_API_KEY=0b890b80e5b319732eca79a94ccbd8a5
OFFERS_USER_ID=577789

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Install the dependencies:
```bash
npm install
```

Start the local server:
```bash
npm run dev
```

---

## Verifying the Flow

### 1. Dynamic Postbacks
To test a conversion simulation, request the postback route with your config:
`http://localhost:3000/api/postback?subid=USER_UUID&payout=1.50&offer_name=App Install&token=your_custom_secure_secret_token`

This credits `$1.50` to the user's profile and creates transaction records.

### 2. Payout Management
Make a withdrawal request from the `/withdraw` page with your USDT address. As an administrator user (ensure `is_admin = true` on your profile row in Supabase database), navigate to `/admin/withdrawals` to view, comment on, and approve or reject requests.
