# Neon Database Migrations

This directory contains the database schema for migrating Liquid Phoenix to Neon.

## Quick Start

### 1. Create a Neon Account

Sign up at [neon.tech](https://neon.tech) and create a new project.

### 2. Get Your Connection String

From your Neon dashboard, copy the connection string. It looks like:

```
postgresql://username:password@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### 3. Apply the Schema

#### Using Neon SQL Editor (Easiest)

1. Go to your Neon project
2. Click on "SQL Editor" in the sidebar
3. Copy all contents from `schema.sql`
4. Paste into the editor
5. Click "Run" or press Cmd/Ctrl + Enter

#### Using psql CLI

```bash
psql "postgresql://username:password@host/db?sslmode=require" -f schema.sql
```

#### Using Neon CLI

```bash
# Install Neon CLI
npm install -g neonctl

# Authenticate
neonctl auth

# Run migration
neonctl sql --project-id your-project-id < schema.sql
```

### 4. Verify the Migration

Check that all tables were created:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- calendar_event_votes
- calendar_events
- messages
- stock_submissions
- stock_votes
- trades
- users
- watchlist_stocks
- watchlist_votes

## Schema Overview

### Core Tables

**users**: User profiles with authentication data
- Email, username, display name
- Profile picture URL
- Admin flag
- Timestamps

**messages**: Community messaging system
- User-generated content
- References user table
- Timestamped

**calendar_events**: Event tracking with approval workflow
- Event types: earnings, dividend, split, meeting, other
- Status: pending, approved, rejected
- Optional ticker association
- Voting support

**stock_votes**: Bullish/bearish sentiment tracking
- One vote per user per ticker
- Vote types: bullish, bearish

**watchlist_stocks**: Stock watchlist with approval workflow
- Detailed stock analysis (thesis, catalyst, risks)
- Pricing information
- Status workflow
- Voting support

### Supporting Tables

**calendar_event_votes**: Votes on calendar events (upvote/downvote)

**watchlist_votes**: Votes on watchlist stocks (upvote/downvote)

### Legacy Tables

**stock_submissions**: Old stock submission system (may be deprecated)

**trades**: Trading history (may be deprecated)

## Key Features

### Automatic Timestamps

All major tables have `created_at` and `updated_at` fields that are automatically managed by database triggers.

### Referential Integrity

- Foreign keys ensure data consistency
- Cascade deletes for user-owned content
- Set NULL for soft references

### Indexes

Optimized indexes on:
- Frequently queried fields (ticker, status, dates)
- Foreign keys
- Sort fields

### Views

Pre-built views for common queries:
- `approved_watchlist_with_votes`: Watchlist stocks with vote counts
- `calendar_events_with_votes`: Calendar events with vote counts
- `stock_vote_summary`: Aggregated stock sentiment

## Security Notes

⚠️ **Important**: This schema does not include Row Level Security (RLS) policies like Supabase.

You'll need to implement authorization in your application layer:

1. **API Layer**: Validate user permissions before queries
2. **Middleware**: Check authentication and authorization
3. **Application Logic**: Enforce business rules

Example patterns:

```typescript
// Check if user is admin
const isAdmin = await db.query(
  'SELECT is_admin FROM users WHERE id = $1',
  [userId]
);

// Filter by user ownership
const messages = await db.query(
  'SELECT * FROM messages WHERE user_id = $1',
  [userId]
);
```

## Maintenance

### Adding Columns

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
```

### Adding Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_messages_content ON messages USING gin(to_tsvector('english', content));
```

### Backing Up

```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Restoring

```bash
psql $DATABASE_URL < backup-20250101.sql
```

## Troubleshooting

### Connection Issues

If you can't connect:
1. Check that your IP is allowed (Neon allows all by default)
2. Verify SSL mode is set: `?sslmode=require`
3. Check connection string format

### Migration Errors

If the migration fails:
1. Check for existing tables: `\dt` in psql
2. Drop tables if needed: `DROP TABLE IF EXISTS table_name CASCADE;`
3. Re-run the schema.sql file

### Performance Issues

For large datasets:
1. Add more specific indexes
2. Use connection pooling
3. Enable Neon's autoscaling
4. Consider read replicas for heavy read workloads

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Neon Discord Community](https://discord.gg/neon)

## Next Steps

After applying the schema:

1. ✅ Update your application's database connection
2. ✅ Migrate authentication to a new provider or custom solution
3. ✅ Migrate file storage if using Supabase Storage
4. ✅ Migrate edge functions if using Supabase Functions
5. ✅ Update environment variables
6. ✅ Test all CRUD operations
7. ✅ Run your application build: `npm run build`

See `NEON-MIGRATION.md` in the project root for complete migration instructions.
