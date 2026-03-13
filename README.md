# ManyHandz

**Many hands make light work.** A household chore coordination and accountability web app.

ManyHandz lets households (families, couples, roommates) create shared chore boards, automatically rotate tasks, track completion with photo proof, and generate fairness scores so every member pulls their weight.

## Features

- **Two Household Modes**: Family (parent/kid with approvals & gamification) and Roommate (equal peers with fairness focus)
- **Auto-Rotation**: Round-robin and fixed assignment scheduling
- **Photo Proof**: Before/after photos with AI-powered verification
- **Fairness Scoring**: Real-time contribution tracking and visualization
- **Gamification** (Family): Points, XP, levels, badges, rewards, goals, competitions
- **Settle Up**: Payment and promise tracking (money + non-monetary)
- **Shared Shopping Lists**: Real-time collaborative lists
- **Push & Email Notifications**: Reminders, approvals, celebrations
- **Weekly Report Cards**: Per-member stats, grades, MVP selection
- **Bonus Challenges**: Limited-time household challenges
- **Head-to-Head Competitions**: Member vs. member with stakes
- **Year-in-Review**: Animated annual stats slideshow
- **Smart AI Suggestions**: Weekly optimization recommendations
- **PWA**: Installable, offline-capable, push notifications

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Components)
- **Language**: TypeScript (strict mode)
- **Database**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Payments**: Stripe (Checkout + Customer Portal)
- **Email**: Resend
- **UI**: shadcn/ui + Tailwind CSS 4 + Radix UI
- **State**: Zustand (client) + TanStack React Query (server)
- **Charts**: Recharts
- **Animations**: Framer Motion
- **PWA**: Serwist
- **AI**: OpenAI GPT-4o / Anthropic Claude

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project
- Stripe account (for subscriptions)
- Resend account (for email)

### Setup

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Copy the environment variables template:

```bash
cp .env.local.example .env.local
```

3. Configure your `.env.local` with:
   - Supabase project URL and keys
   - Stripe secret key, webhook secret, and price IDs
   - Resend API key
   - VAPID keys for push notifications
   - OpenAI/Anthropic API keys (optional, for AI features)

4. Run the database migration in your Supabase project:
   - Go to SQL Editor in Supabase Dashboard
   - Run `supabase/migrations/001_initial_schema.sql`

5. Configure Supabase Storage buckets:
   - Create `avatars` (public)
   - Create `chore-references` (private)
   - Create `proof-photos` (private)

6. Configure Supabase Auth:
   - Enable Email/Password provider
   - Configure Google OAuth provider (optional)
   - Set redirect URLs

7. Start the development server:

```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

### Stripe Setup

1. Create a product with two prices:
   - Monthly: $9.99/month
   - Annual: $99.99/year
2. Set the price IDs in `.env.local`
3. Configure webhook endpoint: `your-domain/api/stripe/webhook`
4. Listen for events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

### Cron Jobs

Set up the following cron endpoints (protected by `CRON_SECRET`):

| Endpoint | Frequency | Purpose |
|---|---|---|
| `/api/cron/rotate-assignments` | Daily | Advance rotation groups |
| `/api/cron/check-overdue` | Hourly | Mark overdue assignments |
| `/api/cron/check-birthdays` | Daily | Detect birthdays |
| `/api/cron/check-challenges` | Hourly | Check challenge expiry |
| `/api/cron/check-competitions` | Hourly | Resolve competitions |
| `/api/cron/generate-reports` | Weekly (Sunday) | Generate weekly reports |

Each cron request must include `Authorization: Bearer <CRON_SECRET>` header.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication pages
│   ├── (app)/             # Authenticated app pages
│   └── api/               # API routes
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # App shell, nav, header
│   └── [feature]/         # Feature-specific components
├── lib/
│   ├── supabase/          # Database clients & queries
│   ├── hooks/             # React Query hooks
│   ├── stores/            # Zustand stores
│   ├── stripe/            # Stripe configuration
│   ├── resend/            # Email templates
│   ├── utils/             # Utility functions
│   └── constants/         # Configuration constants
└── types/                 # TypeScript type definitions
```

## Deployment

The app is Vercel-ready. Deploy with:

```bash
vercel
```

Set all environment variables in the Vercel dashboard.

## License

Private — All rights reserved.
