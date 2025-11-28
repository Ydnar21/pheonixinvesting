# Docker Deployment Guide

This guide explains how to build and run Liquid Phoenix as a Docker container.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, for easier deployment)

## Environment Variables

Make sure you have a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Building the Docker Image

### Option 1: Using Docker directly

```bash
# Build the image
docker build -t liquid-phoenix .

# Run the container
docker run -d -p 3000:80 --name liquid-phoenix liquid-phoenix
```

### Option 2: Using Docker Compose (Recommended)

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the container
docker-compose down
```

## Accessing the Application

Once the container is running, access the application at:
- http://localhost:3000

## Docker Commands

### View running containers
```bash
docker ps
```

### View logs
```bash
docker logs liquid-phoenix
```

### Stop the container
```bash
docker stop liquid-phoenix
```

### Remove the container
```bash
docker rm liquid-phoenix
```

### Rebuild after changes
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Production Deployment

For production deployment:

1. Update `.env` with production Supabase credentials
2. Build the image with a version tag:
   ```bash
   docker build -t liquid-phoenix:1.0.0 .
   ```
3. Push to a container registry (Docker Hub, AWS ECR, etc.)
4. Deploy to your hosting platform (AWS ECS, Google Cloud Run, etc.)

## Container Details

- **Base Image**: nginx:alpine (lightweight, ~23MB)
- **Build Stage**: node:18-alpine
- **Exposed Port**: 80 (mapped to 3000 on host)
- **Web Server**: Nginx with optimized configuration
- **Features**:
  - Gzip compression
  - Static asset caching
  - SPA routing support
  - Security headers

## Troubleshooting

### Container won't start
```bash
# Check logs for errors
docker logs liquid-phoenix

# Ensure no other service is using port 3000
lsof -i :3000
```

### Build fails
```bash
# Clean Docker cache and rebuild
docker system prune -a
docker build --no-cache -t liquid-phoenix .
```

### Environment variables not working
Make sure the `.env` file is in the project root and contains the correct Supabase credentials. The environment variables are baked into the build at build time.
