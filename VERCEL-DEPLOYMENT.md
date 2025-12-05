# Vercel Deployment Guide

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your Supabase project already set up with:
   - Database migrations applied
   - Environment variables configured
   - Edge Functions deployed (if needed)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect it as a Vite project

3. **Configure Environment Variables**
   In the Vercel project settings, add these environment variables:

   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

   Get these values from your Supabase project settings at:
   https://app.supabase.com/project/YOUR_PROJECT/settings/api

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - You'll get a production URL (e.g., `your-app.vercel.app`)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

   Follow the prompts to:
   - Link to existing project or create new one
   - Configure environment variables when prompted

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Environment Variables

Make sure to set these in your Vercel project settings:

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Supabase Dashboard → Settings → API |

## Post-Deployment

1. **Update Supabase Site URL** (for redirects)
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel domain to "Site URL"
   - Add redirect URLs if using OAuth

2. **Test Your Application**
   - Visit your Vercel deployment URL
   - Test authentication
   - Test database operations
   - Test Edge Functions

## Automatic Deployments

Once connected to GitHub, Vercel will automatically:
- Deploy on every push to main branch (production)
- Create preview deployments for pull requests
- Run builds and tests before deploying

## Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update DNS records as instructed by Vercel

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles locally with `npm run build`

### Environment Variables Not Working
- Ensure variables are prefixed with `VITE_`
- Redeploy after adding environment variables
- Check browser console for actual values (Vite inlines them at build time)

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project is not paused
- Ensure your Vercel domain is allowed in Supabase CORS settings

## Monitoring

- View deployment logs in Vercel dashboard
- Set up Vercel Analytics for performance monitoring
- Monitor Supabase usage in Supabase dashboard

## Rollback

If you need to rollback to a previous deployment:
1. Go to Vercel Dashboard → Deployments
2. Find the previous working deployment
3. Click "..." → "Promote to Production"
