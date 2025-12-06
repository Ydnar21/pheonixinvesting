# Migrating to Neon Database

This guide provides instructions for migrating your Liquid Phoenix application from Supabase to Neon.

## Why Neon?

Neon is a serverless PostgreSQL platform that offers:
- **Generous Free Tier**: 0.5 GiB storage, 3 GiB data transfer per month
- **Instant Provisioning**: Database ready in seconds
- **Autoscaling**: Automatically scales compute resources
- **Branching**: Create database branches for testing
- **Cost Effective**: Only pay for what you use with autosuspend

## Prerequisites

1. Create a Neon account at [neon.tech](https://neon.tech)
2. Create a new project in Neon
3. Get your connection string from the Neon dashboard

## Migration Steps

### 1. Update Environment Variables

Replace your Supabase environment variables in `.env`:

```env
# Remove or comment out Supabase variables
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Add Neon connection string
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

### 2. Run the Migration Script

The complete database schema is in `neon-migrations/schema.sql`. You can apply it in several ways:

#### Option A: Using Neon Console (Recommended)
1. Go to your Neon project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `neon-migrations/schema.sql`
4. Paste and execute the SQL

#### Option B: Using psql
```bash
psql $DATABASE_URL -f neon-migrations/schema.sql
```

#### Option C: Using Neon CLI
```bash
npm install -g neonctl
neonctl sql < neon-migrations/schema.sql
```

### 3. Update Database Client Code

Replace the Supabase client with a PostgreSQL client. Update `src/lib/supabase.ts`:

```typescript
import { Pool } from '@neondatabase/serverless';

const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL
});

export const db = pool;
```

Install the Neon serverless driver:
```bash
npm install @neondatabase/serverless
```

### 4. Update Authentication

Neon doesn't include built-in authentication like Supabase. You'll need to:

1. **Option A**: Use a third-party auth provider (Auth0, Clerk, NextAuth)
2. **Option B**: Implement custom authentication with JWT tokens
3. **Option C**: Use Supabase Auth only (keep auth on Supabase, move data to Neon)

### 5. Update Storage

Neon doesn't include file storage. For profile pictures and other files:

1. **Option A**: Use Supabase Storage (keep storage on Supabase)
2. **Option B**: Use Cloudflare R2, AWS S3, or similar
3. **Option C**: Use a CDN service like Cloudinary or ImageKit

### 6. Update Edge Functions

Neon doesn't have built-in serverless functions. Options:

1. **Vercel Functions**: If deploying on Vercel
2. **Cloudflare Workers**: For edge computing
3. **AWS Lambda**: For AWS deployments
4. **Keep on Supabase**: Continue using Supabase Edge Functions

### 7. Migrate Data (If Existing)

If you have existing data in Supabase:

```bash
# Export from Supabase
pg_dump $SUPABASE_DB_URL > backup.sql

# Import to Neon
psql $DATABASE_URL < backup.sql
```

## Schema Overview

The migration includes all tables:

- **users**: User profiles and authentication data
- **messages**: Community messaging system
- **calendar_events**: Event management with voting
- **stock_votes**: Stock voting system
- **watchlist_stocks**: Stock watchlist with approval workflow
- **trades**: Trading history (legacy, may be removed)
- **stock_submissions**: Stock submission system (legacy, may be removed)

## Row Level Security

Note: Neon doesn't support Supabase's RLS policies automatically. You'll need to:

1. Implement authorization in your application code
2. Use PostgreSQL's native RLS (more complex setup)
3. Use database views with appropriate permissions

## Testing

After migration:

1. Test all CRUD operations
2. Verify user authentication flows
3. Test file uploads (if implemented)
4. Check all edge functions (if migrated)
5. Run the build: `npm run build`

## Rollback

If you need to rollback:

1. Restore your `.env` with Supabase credentials
2. Keep your Supabase project active
3. All data remains in Supabase until you delete it

## Support

- Neon Documentation: https://neon.tech/docs
- Neon Discord: https://discord.gg/neon
- GitHub Issues: Create an issue in your repository

## Cost Comparison

### Supabase Free Tier
- 500 MB database space
- 1 GB file storage
- 50,000 monthly active users
- 500 MB egress

### Neon Free Tier
- 0.5 GiB storage
- 3 GiB data transfer per month
- Unlimited compute hours (with autosuspend)
- No file storage included

Choose based on your specific needs!
