# Deploying Liquid Phoenix to Google Cloud

This guide will help you deploy the Liquid Phoenix web application to Google Cloud App Engine.

## Prerequisites

1. **Google Cloud Account**: Create a free account at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud CLI**: Install the gcloud CLI
   - Download from: https://cloud.google.com/sdk/docs/install
   - Or use Cloud Shell in the Google Cloud Console (gcloud is pre-installed)
3. **Node.js 20+**: Ensure you have Node.js installed locally

## Environment Variables Setup

Your Supabase environment variables are stored in `.env` file. These need to be accessible to your deployed application.

The app reads these environment variables at build time:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Make sure your `.env` file contains these values before deploying.

## Deployment Steps

### 1. Initial Setup

First, authenticate with Google Cloud and create/select a project:

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing one)
gcloud projects create liquid-phoenix-app --name="Liquid Phoenix"

# Set the project as default
gcloud config set project liquid-phoenix-app

# Enable App Engine
gcloud app create --region=us-central
```

**Available regions**: us-central, us-east1, europe-west, asia-northeast1, etc.
Choose the region closest to your users.

### 2. Build the Application

Build your React application for production:

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### 3. Deploy to Google Cloud

Deploy using the convenience script:

```bash
npm run deploy
```

Or deploy manually:

```bash
gcloud app deploy
```

**First deployment** will take 5-10 minutes. Subsequent deployments are faster (2-3 minutes).

### 4. View Your Application

Once deployed, your app will be available at:
```
https://liquid-phoenix-app.uc.r.appspot.com
```

Or open it directly:
```bash
gcloud app browse
```

## Deployment Options

### Preview Deployment (No Traffic Switch)

Test your deployment without affecting production:

```bash
npm run deploy:preview
```

This creates a new version but doesn't route traffic to it. You can test it and manually promote later.

### View Deployment Logs

```bash
gcloud app logs tail -s default
```

### Manage Versions

```bash
# List all versions
gcloud app versions list

# Route traffic to a specific version
gcloud app services set-traffic default --splits=v2=1

# Delete old versions
gcloud app versions delete v1
```

## Custom Domain Setup

### 1. Add Custom Domain

```bash
gcloud app domain-mappings create www.liquidphoenix.com
```

### 2. Verify Domain Ownership

Follow the instructions provided by Google Cloud to verify domain ownership through your domain registrar.

### 3. Update DNS Records

Add the DNS records provided by Google Cloud to your domain registrar:
- A record pointing to App Engine IP
- AAAA record for IPv6 (optional)
- CNAME for www subdomain

### 4. Enable SSL

SSL certificates are automatically provisioned by Google Cloud (takes 15-60 minutes).

## Cost Management

### App Engine Pricing

- **Free Tier**: 28 instance hours per day
- **F1 Instance**: Automatic scaling from 0 to multiple instances
- **Estimated cost**: $0-$10/month for small apps with moderate traffic

### Monitor Costs

```bash
# View current month's costs
gcloud billing accounts list
gcloud billing projects list
```

Visit [Google Cloud Console > Billing](https://console.cloud.google.com/billing) for detailed cost breakdowns.

### Set Budget Alerts

1. Go to Google Cloud Console
2. Navigate to Billing > Budgets & alerts
3. Create a budget (e.g., $10/month)
4. Set alerts at 50%, 90%, and 100%

## Scaling Configuration

The `app.yaml` file controls scaling:

```yaml
automatic_scaling:
  min_idle_instances: 0  # Scale to 0 when no traffic (saves money)
  max_idle_instances: 1  # Keep max 1 idle instance ready
```

### For High Traffic

Modify `app.yaml`:

```yaml
automatic_scaling:
  min_idle_instances: 1
  max_idle_instances: 10
  min_pending_latency: 30ms
  max_pending_latency: 100ms
```

## Troubleshooting

### Build Fails

```bash
# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Environment Variables Not Working

Ensure `.env` file exists and contains:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

These are bundled into the build at compile time.

### Deployment Takes Too Long

If deployment times out:
```bash
gcloud config set app/cloud_build_timeout 1600
gcloud app deploy
```

### View Application Logs

```bash
# Real-time logs
gcloud app logs tail -s default

# Recent logs
gcloud app logs read --limit=100
```

### Check Deployment Status

```bash
gcloud app versions list
gcloud app services list
```

## Security Best Practices

1. **Never commit `.env` file**: Keep your Supabase keys secure
2. **Use Row Level Security**: Ensure RLS is enabled on all Supabase tables
3. **Enable HTTPS only**: Already configured in `app.yaml`
4. **Monitor access logs**: Regularly check for unusual activity
5. **Set up budget alerts**: Prevent unexpected costs

## Updating Your Application

1. Make changes to your code
2. Test locally: `npm run dev`
3. Build: `npm run build`
4. Deploy: `npm run deploy`
5. Verify: Visit your URL and test functionality

## Rolling Back

If something goes wrong:

```bash
# List versions
gcloud app versions list

# Route traffic back to previous version
gcloud app services set-traffic default --splits=v1=1

# Delete bad version
gcloud app versions delete v2
```

## Additional Resources

- [Google Cloud App Engine Documentation](https://cloud.google.com/appengine/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vite Production Build](https://vitejs.dev/guide/build.html)

## Support

For issues specific to:
- **Google Cloud**: [Google Cloud Support](https://cloud.google.com/support)
- **Supabase**: [Supabase Support](https://supabase.com/support)
- **Application**: Check application logs with `gcloud app logs tail`
