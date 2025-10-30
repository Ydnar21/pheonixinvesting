# Quick Start - Deploy to Google Cloud

The fastest way to get Liquid Phoenix running on Google Cloud.

## Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
chmod +x setup-gcloud.sh
./setup-gcloud.sh
```

This will guide you through the entire setup process.

## Option 2: Manual Setup

### Step 1: Install Google Cloud CLI

Download from: https://cloud.google.com/sdk/docs/install

Or use [Google Cloud Shell](https://console.cloud.google.com/) (gcloud is pre-installed).

### Step 2: Authenticate

```bash
gcloud auth login
```

### Step 3: Create Project

```bash
gcloud projects create YOUR-PROJECT-ID --name="Liquid Phoenix"
gcloud config set project YOUR-PROJECT-ID
```

### Step 4: Enable App Engine

```bash
gcloud app create --region=us-central
```

### Step 5: Deploy

```bash
npm run deploy
```

Done! Your app will be live at: `https://YOUR-PROJECT-ID.uc.r.appspot.com`

## Environment Variables

Make sure your `.env` file contains:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These are built into the app at compile time.

## Common Commands

```bash
# Deploy latest changes
npm run deploy

# View live logs
gcloud app logs tail -s default

# Open app in browser
gcloud app browse

# View all versions
gcloud app versions list
```

## Costs

- **Free Tier**: 28 instance hours per day
- **Expected cost**: $0-$10/month for small apps
- Set up budget alerts in [Google Cloud Console](https://console.cloud.google.com/billing)

## Troubleshooting

**Build fails?**
```bash
rm -rf node_modules
npm install
npm run build
```

**Deployment times out?**
```bash
gcloud config set app/cloud_build_timeout 1600
gcloud app deploy
```

**Need help?** Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed documentation.

## Next Steps

1. Set up a custom domain (optional)
2. Configure budget alerts
3. Enable monitoring and logging
4. Set up CI/CD with GitHub Actions (optional)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full documentation.
