# Neon Database Setup Guide

Your Liquid Phoenix application has been successfully migrated to use Neon database instead of Supabase.

## What Changed

### Database Client
- Replaced `@supabase/supabase-js` with `@neondatabase/serverless`
- Created custom database helper functions (`db.query`, `db.queryOne`, `db.execute`)
- Added custom JWT-based authentication system

### Authentication
- Implemented custom username/password authentication
- Uses localStorage for session management
- Passwords are base64 encoded (use a proper hashing library like bcrypt in production)

### Updated Files
- `src/lib/supabase.ts` - New Neon database client and auth functions
- `src/context/AuthContext.tsx` - Custom authentication context
- `src/components/Messages.tsx` - Simplified messaging (features disabled until tables are added)
- `src/components/Navbar.tsx` - Updated to use new db client
- `src/components/ProfileModal.tsx` - Updated to use new db client
- `src/pages/Community.tsx` - Rewritten to use messages table
- `src/pages/Watchlist.tsx` - Updated to use watchlist_stocks table
- `src/pages/WatchlistApproval.tsx` - Updated to use watchlist_stocks table
- `.env` and `.env.example` - New environment variables for Neon

## Setup Instructions

### 1. Create a Neon Account

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project
3. Copy your connection string

### 2. Update Environment Variables

Edit your `.env` file and replace the placeholder with your actual Neon connection string:

```env
VITE_DATABASE_URL=postgresql://your-user:your-password@your-host.neon.tech/neondb?sslmode=require
VITE_JWT_SECRET=change-this-to-a-secure-random-string-in-production
```

### 3. Apply Database Schema

Run the migration script from `neon-migrations/schema.sql`:

#### Option A: Using Neon Console (Easiest)
1. Go to your Neon project dashboard
2. Navigate to the SQL Editor
3. Copy the entire contents of `neon-migrations/schema.sql`
4. Paste and execute

#### Option B: Using psql
```bash
psql "your-connection-string" -f neon-migrations/schema.sql
```

### 4. Create an Admin User

After applying the schema, create an admin user:

```sql
INSERT INTO users (email, username, display_name, is_admin)
VALUES ('admin-password-hash', 'admin', 'Admin User', true)
RETURNING id;
```

Note: The email field currently stores the hashed password. You'll need to use btoa('your-password') to generate the hash.

### 5. Test the Application

```bash
npm run dev
```

Try logging in with your admin credentials.

## Important Security Notes

### Current Authentication (Development Only)
The current authentication implementation uses:
- Base64 encoding for passwords (NOT secure for production)
- Simple JWT-like tokens stored in localStorage
- Basic token validation

### For Production
Before deploying to production, you MUST:

1. **Use proper password hashing**: Install and use bcrypt or argon2
   ```bash
   npm install bcrypt
   npm install @types/bcrypt --save-dev
   ```

2. **Implement secure session management**: Consider using httpOnly cookies

3. **Add CSRF protection**

4. **Use environment-specific JWT secrets**

5. **Implement rate limiting on auth endpoints**

6. **Add password strength requirements**

7. **Implement password reset functionality**

## Features Status

### ✅ Working Features
- User authentication (sign up, sign in, sign out)
- Community chat messages
- Watchlist stocks (view, submit, approve/reject)
- Profile viewing and bio editing
- Admin role management

### ⚠️ Partially Working
- Profile pictures (upload disabled - needs file storage solution)
- Direct messaging (disabled - needs direct_messages table)
- User follows (disabled - needs user_follows table)

### ❌ Not Yet Implemented
- Real-time updates (Neon doesn't have built-in realtime like Supabase)
- File storage (need to integrate external service)
- Email notifications
- Password reset

## Database Schema

The application uses these main tables:
- `users` - User profiles and authentication
- `messages` - Community chat messages
- `watchlist_stocks` - Stock watchlist with approval workflow
- `watchlist_votes` - Votes on watchlist stocks
- `calendar_events` - Event tracking
- `calendar_event_votes` - Votes on events
- `stock_votes` - Stock sentiment votes

See `neon-migrations/schema.sql` for the complete schema.

## Adding Missing Features

### To add direct messaging:
1. The `direct_messages` table schema isn't in the current migration
2. Add it to your database
3. Update `src/components/Messages.tsx` to use it

### To add user follows:
1. The `user_follows` table schema isn't in the current migration
2. Add it to your database
3. Update `src/components/ProfileModal.tsx` to use it

### To add file storage:
Consider these options:
- Cloudflare R2 (S3-compatible, affordable)
- AWS S3
- Supabase Storage (you can keep storage on Supabase)
- Cloudinary for images

## Troubleshooting

### Build Errors
```bash
npm run build
```
All TypeScript errors should be resolved. If you see import errors, check that all files are importing from `'../lib/supabase'` and using `db` instead of `supabase`.

### Connection Errors
- Verify your `VITE_DATABASE_URL` is correct
- Check that SSL mode is enabled: `?sslmode=require`
- Ensure your IP is allowed (Neon allows all IPs by default)

### Authentication Issues
- Clear localStorage and try again
- Check that the `users` table has data
- Verify the JWT_SECRET is set

## Migration from Existing Data

If you have existing data in Supabase:

```bash
# Export from Supabase
pg_dump "your-supabase-connection-string" > backup.sql

# Import to Neon
psql "your-neon-connection-string" < backup.sql
```

You may need to adjust table names and schemas to match the new structure.

## Support

For issues:
1. Check the browser console for errors
2. Check the Neon dashboard for database errors
3. Review the NEON-MIGRATION.md file for additional information

## Next Steps

1. Set up your Neon database
2. Apply the schema
3. Create an admin user
4. Test the application
5. Implement proper password hashing before production
6. Add any missing features you need
7. Set up file storage if needed
8. Configure production environment variables
