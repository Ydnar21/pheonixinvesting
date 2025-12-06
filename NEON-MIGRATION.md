# Migrating to Neon Database

## Important Considerations

Your current database schema is tightly integrated with **Supabase Authentication** and **Row Level Security (RLS)**. Moving to Neon will require significant changes because:

1. **No Built-in Authentication**: Neon doesn't have `auth.users` table or `auth.uid()` function
2. **RLS Policies Need Modification**: All policies using `auth.uid()` won't work
3. **Storage Integration**: Supabase Storage won't work with Neon
4. **Edge Functions**: These are Supabase-specific and won't transfer

## Two Migration Approaches

### Option 1: Neon + Custom Auth (Complex)

Replace Supabase Auth with a custom authentication solution.

**Pros:**
- Full control over database
- Potentially lower costs at scale
- More flexibility

**Cons:**
- Must implement your own authentication system
- Requires rewriting all RLS policies
- Need to manage user sessions yourself
- Must handle password hashing, JWT tokens, etc.
- Lose Supabase Storage (need alternative like S3)
- Lose Edge Functions (need alternative serverless)

### Option 2: Keep Supabase, Use Neon for Non-Auth Data (Hybrid)

Keep using Supabase for authentication and use Neon for application data.

**Pros:**
- Keep Supabase Auth working
- Use Neon for cost-effective data storage
- Can still use Supabase Storage

**Cons:**
- Managing two databases adds complexity
- Need to sync user IDs between systems
- More configuration to maintain

## Recommended Approach

**Unless you have a specific reason to migrate, staying with Supabase is recommended** because:
- Your app is already built for Supabase
- Authentication is complex and error-prone to build
- Supabase free tier is generous (500MB database, 50k monthly active users)
- RLS policies provide automatic security
- Edge Functions handle serverless needs

## If You Must Use Neon: Migration Steps

### Step 1: Set Up Neon Database

1. Create a [Neon account](https://neon.tech)
2. Create a new project
3. Get your connection string from the Neon dashboard

### Step 2: Install Neon Client

```bash
npm install @neondatabase/serverless
```

### Step 3: Create Modified Schema

The provided `neon-migrations` directory contains a modified schema that:
- Creates a `users` table instead of using `auth.users`
- Removes all RLS policies (you'll handle auth in application code)
- Keeps the same table structures

### Step 4: Run Migrations

```bash
# Install psql if you don't have it
# macOS
brew install postgresql

# Ubuntu/Debian
sudo apt-get install postgresql-client

# Connect to Neon and run migrations
psql "YOUR_NEON_CONNECTION_STRING" < neon-migrations/schema.sql
```

### Step 5: Update Application Code

You'll need to:

1. **Replace Supabase Client** in `src/lib/supabase.ts`
2. **Implement Authentication** (consider using NextAuth.js, Clerk, or Auth0)
3. **Add Authorization Checks** in your React components
4. **Handle Sessions** manually in your app
5. **Replace Storage** (use S3, Cloudinary, or similar)

### Step 6: Environment Variables

Update `.env`:

```env
# Remove Supabase variables
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Add Neon connection
VITE_DATABASE_URL=your_neon_connection_string

# Add auth provider credentials (e.g., Clerk, Auth0)
VITE_AUTH_PROVIDER_KEY=...
```

## Authentication Alternatives

If you migrate to Neon, you'll need an auth provider:

### 1. Clerk (Recommended for Ease)
- Drop-in authentication components
- Handles everything: signup, login, sessions
- Free tier: 10k monthly active users
- [clerk.com](https://clerk.com)

### 2. Auth0
- Enterprise-grade authentication
- Many social providers
- Free tier: 7k active users
- [auth0.com](https://auth0.com)

### 3. NextAuth.js
- Open source, self-hosted
- Works with many providers
- More setup required
- [next-auth.js.org](https://next-auth.js.org)

### 4. Custom Auth (Not Recommended)
- Build your own with JWT
- Must handle password hashing, tokens, refresh
- Security risks if not done correctly

## Code Changes Required

### 1. Database Client

Replace `src/lib/supabase.ts` with Neon client:

```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(import.meta.env.VITE_DATABASE_URL);

export { sql };
```

### 2. Query Changes

Supabase queries like this:
```typescript
const { data } = await supabase
  .from('stock_posts')
  .select('*')
  .eq('user_id', userId);
```

Become Neon queries like this:
```typescript
const data = await sql`
  SELECT * FROM stock_posts
  WHERE user_id = ${userId}
`;
```

### 3. Authentication Context

Replace `src/context/AuthContext.tsx` to use your chosen auth provider instead of Supabase Auth.

### 4. Protected Routes

Add manual checks for authentication in every component that needs it.

## Cost Comparison

### Supabase Free Tier
- 500MB database
- 1GB file storage
- 2GB bandwidth
- 50k monthly active users
- Row Level Security included
- Edge Functions: 500k invocations/month

### Neon Free Tier
- 0.5GB storage (3GB with Neon Pro)
- 191 compute hours/month
- Shared compute
- No authentication
- No storage
- No edge functions

## Testing Your Migration

1. **Create test accounts** in your new auth system
2. **Test all CRUD operations** for posts, comments, likes
3. **Test file uploads** with new storage solution
4. **Test Edge Function replacements** (if any)
5. **Verify data integrity** between old and new systems

## Rollback Plan

Before migrating:
1. **Backup your Supabase data** using pg_dump
2. **Keep your Supabase project active** during migration
3. **Test thoroughly** before switching production traffic

## Summary

**Migration Complexity: HIGH**

This migration requires:
- Rewriting authentication (100+ hours)
- Modifying all database queries
- Replacing storage solution
- Replacing Edge Functions
- Removing all RLS policies
- Adding authorization checks throughout app
- Testing every feature

**Recommendation: Stay with Supabase unless you have specific requirements that Neon addresses better.**

If cost is the concern, Supabase free tier is very generous. If you need to scale beyond free tier, compare actual costs at your expected usage levels.
