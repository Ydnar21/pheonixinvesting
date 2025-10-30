#!/bin/bash

# Liquid Phoenix - Google Cloud Setup Script
# This script helps you set up and deploy your application to Google Cloud

set -e

echo "🔥 Liquid Phoenix - Google Cloud Deployment Setup"
echo "=================================================="
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI (gcloud) is not installed."
    echo ""
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    echo "Or use Google Cloud Shell which has gcloud pre-installed."
    exit 1
fi

echo "✅ Google Cloud CLI found"
echo ""

# Login check
echo "Checking Google Cloud authentication..."
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "Please login to Google Cloud:"
    gcloud auth login
fi

ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1)
echo "✅ Logged in as: $ACCOUNT"
echo ""

# Project setup
echo "Setting up Google Cloud project..."
read -p "Enter your project ID (or press Enter to create a new one): " PROJECT_ID

if [ -z "$PROJECT_ID" ]; then
    echo "Creating new project..."
    read -p "Enter a project ID (lowercase, hyphens allowed): " NEW_PROJECT_ID
    read -p "Enter a project name: " PROJECT_NAME

    gcloud projects create "$NEW_PROJECT_ID" --name="$PROJECT_NAME"
    PROJECT_ID="$NEW_PROJECT_ID"
    echo "✅ Project created: $PROJECT_ID"
else
    echo "Using existing project: $PROJECT_ID"
fi

gcloud config set project "$PROJECT_ID"
echo ""

# Enable App Engine
echo "Checking App Engine status..."
if gcloud app describe &> /dev/null; then
    echo "✅ App Engine already enabled"
else
    echo "Enabling App Engine..."
    echo "Available regions:"
    echo "  - us-central (Iowa)"
    echo "  - us-east1 (South Carolina)"
    echo "  - europe-west (Belgium)"
    echo "  - asia-northeast1 (Tokyo)"
    echo ""
    read -p "Enter region (default: us-central): " REGION
    REGION=${REGION:-us-central}

    gcloud app create --region="$REGION"
    echo "✅ App Engine enabled in $REGION"
fi
echo ""

# Check environment variables
echo "Checking environment variables..."
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo ""
    echo "Please create a .env file with your Supabase credentials:"
    echo "VITE_SUPABASE_URL=your_supabase_url"
    echo "VITE_SUPABASE_ANON_KEY=your_anon_key"
    exit 1
fi

if ! grep -q "VITE_SUPABASE_URL" .env || ! grep -q "VITE_SUPABASE_ANON_KEY" .env; then
    echo "❌ .env file is missing required variables!"
    echo ""
    echo "Please ensure your .env file contains:"
    echo "VITE_SUPABASE_URL=your_supabase_url"
    echo "VITE_SUPABASE_ANON_KEY=your_anon_key"
    exit 1
fi

echo "✅ Environment variables found"
echo ""

# Build application
echo "Building application..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ Build failed - dist directory not found"
    exit 1
fi

echo "✅ Application built successfully"
echo ""

# Deploy
echo "🚀 Ready to deploy!"
echo ""
read -p "Deploy to Google Cloud now? (y/n): " DEPLOY

if [ "$DEPLOY" = "y" ] || [ "$DEPLOY" = "Y" ]; then
    echo "Deploying..."
    gcloud app deploy --quiet

    echo ""
    echo "=================================================="
    echo "✅ Deployment complete!"
    echo ""
    echo "Your application is available at:"
    gcloud app browse --no-launch-browser
    echo ""
    echo "To view logs:"
    echo "  gcloud app logs tail -s default"
    echo ""
    echo "To deploy updates:"
    echo "  npm run deploy"
    echo "=================================================="
else
    echo ""
    echo "Deployment cancelled. To deploy later, run:"
    echo "  npm run deploy"
fi
