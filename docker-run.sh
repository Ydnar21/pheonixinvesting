#!/bin/bash

# Docker Quick Start Script for Liquid Phoenix

set -e

echo "🔥 Liquid Phoenix - Docker Deployment Script"
echo "============================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "   Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "   Please create a .env file with your Supabase credentials:"
    echo "   VITE_SUPABASE_URL=your_supabase_url"
    echo "   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Parse command
case "${1:-build}" in
    build)
        echo "🔨 Building Docker image..."
        docker build -t liquid-phoenix .
        echo "✅ Build complete!"
        echo ""
        echo "Run 'bash docker-run.sh start' to start the container"
        ;;

    start)
        echo "🚀 Starting Liquid Phoenix container..."
        docker run -d -p 3000:80 --name liquid-phoenix liquid-phoenix
        echo "✅ Container started!"
        echo ""
        echo "🌐 Application is running at: http://localhost:3000"
        echo ""
        echo "Useful commands:"
        echo "  bash docker-run.sh logs  - View logs"
        echo "  bash docker-run.sh stop  - Stop container"
        ;;

    stop)
        echo "🛑 Stopping container..."
        docker stop liquid-phoenix
        docker rm liquid-phoenix
        echo "✅ Container stopped and removed"
        ;;

    logs)
        echo "📋 Container logs (Ctrl+C to exit):"
        docker logs -f liquid-phoenix
        ;;

    restart)
        echo "🔄 Restarting container..."
        bash "$0" stop
        sleep 2
        bash "$0" start
        ;;

    rebuild)
        echo "🔧 Rebuilding from scratch..."
        bash "$0" stop 2>/dev/null || true
        docker build --no-cache -t liquid-phoenix .
        bash "$0" start
        ;;

    compose-up)
        echo "🚀 Starting with Docker Compose..."
        docker-compose up -d
        echo "✅ Services started!"
        echo "🌐 Application is running at: http://localhost:3000"
        ;;

    compose-down)
        echo "🛑 Stopping Docker Compose services..."
        docker-compose down
        echo "✅ Services stopped"
        ;;

    *)
        echo "Usage: bash docker-run.sh [command]"
        echo ""
        echo "Commands:"
        echo "  build         - Build the Docker image"
        echo "  start         - Start the container"
        echo "  stop          - Stop and remove the container"
        echo "  restart       - Restart the container"
        echo "  rebuild       - Rebuild image and restart"
        echo "  logs          - View container logs"
        echo "  compose-up    - Start using Docker Compose"
        echo "  compose-down  - Stop Docker Compose services"
        ;;
esac
