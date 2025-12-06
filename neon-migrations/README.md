# Neon Database Migration Files

## ⚠️ WARNING: READ BEFORE PROCEEDING

This migration will **completely change your application architecture**. This is not a simple database switch.

Your application currently relies on:
- Supabase Authentication (`auth.uid()`, `auth.users`)
- Row Level Security (automatic security)
- Supabase Storage (for profile pictures)
- Edge Functions (for serverless operations)

**None of these will work after migrating to Neon.**

## What's Included

- `schema.sql` - Modified database schema that works with Neon
  - Creates `users` table (replaces `auth.users`)
  - Removes all RLS policies
  - Removes Supabase-specific functions

## Prerequisites

1. Neon account and project created
2. PostgreSQL client installed (`psql`)
3. Connection string from Neon dashboard

## Running the Migration

### Step 1: Connect to Neon

Get your connection string from the Neon dashboard. It looks like:
```
postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/dbname
```

### Step 2: Run the Schema

```bash
# From the project root
psql "YOUR_NEON_CONNECTION_STRING" < neon-migrations/schema.sql
```

### Step 3: Verify Tables Were Created

```bash
psql "YOUR_NEON_CONNECTION_STRING" -c "\dt"
```

You should see:
- users
- profiles
- stock_posts
- post_comments
- post_likes
- comment_likes
- stock_votes
- calendar_events
- calendar_votes
- user_follows
- direct_messages
- watchlist_stocks

## What This Schema Does NOT Include

1. **No Authentication System**
   - You must build or integrate one (Clerk, Auth0, custom)
   - Password hashing, JWT tokens, sessions - all your responsibility

2. **No Authorization/Security**
   - All data is accessible to anyone with DB access
   - You must add checks in your application code

3. **No File Storage**
   - `profile_picture_url` is just a text field
   - You need S3, Cloudinary, or similar

4. **No Edge Functions**
   - Serverless functions won't work
   - Need alternative for background jobs

## After Migration

You need to:

### 1. Implement Authentication

Choose one:
- **Clerk** (easiest): https://clerk.com
- **Auth0** (enterprise): https://auth0.com
- **NextAuth.js** (open source): https://next-auth.js.org
- **Custom** (not recommended): Build JWT auth yourself

### 2. Replace Database Client

Replace `src/lib/supabase.ts`:

```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export { sql };
```

### 3. Rewrite All Queries

Before (Supabase):
```typescript
const { data } = await supabase
  .from('stock_posts')
  .select('*')
  .eq('user_id', userId);
```

After (Neon):
```typescript
const data = await sql`
  SELECT * FROM stock_posts
  WHERE user_id = ${userId}
`;
```

### 4. Add Authorization Checks

Example for deleting a post:

```typescript
// Get current user ID from your auth system
const currentUserId = await getCurrentUser();

// Delete only if user owns the post
const result = await sql`
  DELETE FROM stock_posts
  WHERE id = ${postId} AND user_id = ${currentUserId}
  RETURNING *
`;

// Check if any rows were deleted
if (result.length === 0) {
  throw new Error('Unauthorized or post not found');
}
```

### 5. Replace Storage Solution

Options:
- AWS S3
- Cloudinary
- UploadThing
- ImageKit

### 6. Update Environment Variables

```env
# Remove
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Add
VITE_DATABASE_URL=your_neon_connection_string
VITE_AUTH_PROVIDER_KEY=...
VITE_STORAGE_URL=...
```

## Data Migration

If you have existing data in Supabase:

### Export from Supabase

```bash
# Get your Supabase DB connection string from Settings > Database
pg_dump "YOUR_SUPABASE_CONNECTION_STRING" \
  --table=profiles \
  --table=stock_posts \
  --table=post_comments \
  --table=post_likes \
  --table=comment_likes \
  --data-only \
  > supabase_data.sql
```

### Import to Neon

```bash
# Map auth.users IDs to new users table
# This requires manual ID mapping since auth.users won't exist

psql "YOUR_NEON_CONNECTION_STRING" < supabase_data.sql
```

## Testing Checklist

After migration, test:

- [ ] User registration
- [ ] User login
- [ ] User logout
- [ ] Create post (only as authenticated user)
- [ ] Edit own post (not others' posts)
- [ ] Delete own post (not others' posts)
- [ ] View posts (public)
- [ ] Add comments
- [ ] Like posts/comments
- [ ] Profile picture upload
- [ ] Direct messages (only to mutual follows)
- [ ] Calendar events
- [ ] Watchlist management
- [ ] Admin functions (if admin)

## Rollback

To rollback:
1. Keep your Supabase project running during migration
2. Don't delete Supabase data until 100% certain
3. Can switch back by reverting code changes

## Support

For Neon-specific issues:
- Neon Docs: https://neon.tech/docs
- Neon Discord: https://discord.gg/neon

For authentication:
- Clerk Docs: https://clerk.com/docs
- Auth0 Docs: https://auth0.com/docs

## Estimated Effort

- Database migration: 1-2 hours
- Authentication implementation: 20-40 hours
- Query rewrites: 10-20 hours
- Storage solution: 5-10 hours
- Testing: 10-20 hours

**Total: 46-92 hours of development work**

## Recommendation

Unless you have a specific requirement for Neon, **consider staying with Supabase**. The effort required for this migration is substantial and you'll need to build/integrate many features that Supabase provides out of the box.
