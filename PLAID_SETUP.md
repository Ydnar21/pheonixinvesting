# Plaid Integration Setup Guide

This guide will help you connect Plaid to enable secure, read-only Robinhood account integration.

## Overview

The application uses **Plaid** to securely connect to Robinhood accounts with read-only access. Your credentials are never stored by this application.

## Security Features

✅ **OAuth 2.0 Authentication** - Industry-standard secure protocol
✅ **Read-Only Access** - Can only view data, cannot execute trades
✅ **No Credential Storage** - Your login info never touches this app
✅ **Token-Based** - Uses temporary, revocable access tokens
✅ **Encrypted** - All data transfer over HTTPS
✅ **Compliant** - Plaid is SOC 2 Type II certified

## Setup Steps

### 1. Create a Plaid Account

1. Go to https://dashboard.plaid.com/signup
2. Sign up for a Plaid account
3. Complete the verification process

### 2. Get Your API Credentials

1. Log in to https://dashboard.plaid.com
2. Navigate to **Team Settings** → **Keys**
3. Copy your credentials:
   - **Client ID**
   - **Sandbox Secret** (for development)
   - **Development Secret** (for testing with real institutions)
   - **Production Secret** (for live use)

### 3. Configure Environment Variables

Update your `.env` file with your Plaid credentials:

```bash
# Plaid Configuration
VITE_PLAID_ENV=sandbox
PLAID_CLIENT_ID=your_actual_client_id_here
PLAID_SECRET=your_actual_secret_here
```

**Environment Options:**
- `sandbox` - Test environment with fake data (free)
- `development` - Test with real institutions (free for limited use)
- `production` - Live environment (requires paid plan)

### 4. Configure Plaid Secrets in Supabase

The Edge Function needs access to your Plaid credentials. These are automatically configured, but if you need to verify:

1. Go to your Supabase Dashboard
2. Navigate to **Edge Functions** → **Secrets**
3. Ensure these secrets are set:
   - `PLAID_CLIENT_ID`
   - `PLAID_SECRET`
   - `PLAID_ENV`

### 5. Enable Plaid Products

1. In Plaid Dashboard, go to **Products**
2. Enable **Investments** product
3. Accept the terms and conditions

### 6. Configure Allowed Institutions (Optional)

For development/production environments:

1. Go to **Institutions** in Plaid Dashboard
2. Search for and enable "Robinhood"
3. Other investment platforms can be enabled as needed

## How It Works

### Connection Flow

1. **User clicks "Connect Robinhood"**
   - Frontend requests a Link Token from backend
   - Backend calls Plaid API to create Link Token

2. **Plaid Link Opens**
   - User sees Plaid's secure interface
   - User selects Robinhood and logs in via Plaid
   - Credentials go directly to Plaid (never to your app)

3. **Token Exchange**
   - Plaid returns a temporary Public Token
   - Backend exchanges Public Token for permanent Access Token
   - Access Token is encrypted and stored in database

4. **Data Sync**
   - Backend uses Access Token to fetch holdings
   - Portfolio data is synced to database
   - Frontend displays real portfolio data

### Data Flow Diagram

```
User Browser → Plaid Link UI → Robinhood Login
     ↓              ↓
     ↓         Public Token
     ↓              ↓
Edge Function ← Access Token → Supabase DB
     ↓
Plaid API (fetch holdings)
     ↓
Portfolio Data → Supabase DB → User Browser
```

## Testing in Sandbox Mode

When using `VITE_PLAID_ENV=sandbox`:

1. Click "Connect Robinhood"
2. In Plaid Link, select any institution
3. Use test credentials:
   - Username: `user_good`
   - Password: `pass_good`
4. Select any accounts to link
5. Your test portfolio will appear

## Development vs Production

### Sandbox (Free)
- Fake data only
- Test the integration flow
- No real bank connections

### Development (Free tier available)
- Connect real institutions
- Limited API calls per month
- For testing before launch

### Production (Paid)
- Required for live users
- Pricing based on usage
- Requires Plaid review and approval

## Pricing

Plaid pricing for Investments product (as of 2025):
- **Sandbox**: Free
- **Development**: Free for first 100 items/month
- **Production**: Contact Plaid for pricing

## Security Best Practices

1. **Never commit secrets** - Keep `.env` out of version control
2. **Use environment-specific secrets** - Different keys for dev/prod
3. **Rotate tokens regularly** - Update Plaid secrets periodically
4. **Monitor access** - Check Plaid Dashboard for unusual activity
5. **Implement token refresh** - Handle expired Access Tokens gracefully

## Troubleshooting

### "Invalid credentials" error
- Verify `PLAID_CLIENT_ID` and `PLAID_SECRET` are correct
- Check that secrets are set in Supabase Edge Function

### "Institution not available"
- Make sure you're in the correct environment (sandbox/dev/prod)
- In sandbox, all institutions work with test credentials
- In dev/prod, institution must be enabled in Plaid Dashboard

### Link Token creation fails
- Verify Plaid account is active
- Check that Investments product is enabled
- Ensure Edge Function has proper environment variables

### Holdings not syncing
- Check browser console for errors
- Verify Plaid Access Token is valid
- Check Supabase database has proper RLS policies

## API Reference

### Edge Function Endpoints

**POST** `/functions/v1/plaid-handler/create_link_token`
- Creates a Plaid Link token for initializing the connection flow

**POST** `/functions/v1/plaid-handler/exchange_public_token`
- Exchanges public token for access token
- Body: `{ "public_token": "public-xxx" }`

**POST** `/functions/v1/plaid-handler/sync_holdings`
- Fetches latest holdings from Plaid and updates database

### Database Tables

**plaid_items**
- Stores Plaid connection information per user
- Fields: `user_id`, `access_token`, `item_id`, `institution_id`, etc.

**portfolio_holdings**
- Stores portfolio positions fetched from Plaid
- Fields: `user_id`, `symbol`, `quantity`, `cost_basis`, `current_price`, etc.

## Support

- **Plaid Documentation**: https://plaid.com/docs/
- **Plaid Support**: https://dashboard.plaid.com/support
- **Status Page**: https://status.plaid.com/

## Next Steps

After setting up Plaid:

1. Test in sandbox mode
2. Request access to development environment
3. Test with real (but test) accounts
4. Apply for production access
5. Launch with real users

---

**Important**: This integration is for educational/prototype purposes. For production use, ensure compliance with financial regulations and Plaid's terms of service.
