# Liquid Phoenix 🔥

A free investment tracking and community platform for people building wealth and escaping the 9-5.

## Features

- **Portfolio Tracking**: Monitor stocks and options positions with real-time performance tracking
- **Community Discussions**: Share insights and vote on investment ideas
- **Market News**: Stay informed with latest market developments
- **Goal Tracking**: Track progress toward financial freedom goals
- **Due Diligence**: Document and share research on positions

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Google Cloud App Engine

## Local Development

### Prerequisites

- Node.js 20+
- npm or yarn
- Supabase account

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173)

## Production Deployment

### Option 1: Docker (Recommended)

See [DOCKER.md](./DOCKER.md) for detailed Docker deployment instructions.

Quick start with Docker:
```bash
# Using the helper script
bash docker-run.sh build
bash docker-run.sh start

# Or using Docker Compose
docker-compose up -d
```

Access at [http://localhost:3000](http://localhost:3000)

### Option 2: Deploy to Google Cloud

See [QUICKSTART.md](./QUICKSTART.md) for quick deployment or [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

Quick deploy:
```bash
./setup-gcloud.sh
```

Or manually:
```bash
npm run deploy
```

## Project Structure

```
liquid-phoenix/
├── src/
│   ├── components/     # React components
│   ├── pages/          # Page components
│   ├── context/        # React context (Auth)
│   ├── lib/            # Supabase client
│   └── index.css       # Global styles
├── public/             # Static assets
├── supabase/
│   ├── migrations/     # Database migrations
│   └── functions/      # Edge functions
├── app.yaml           # Google Cloud configuration
└── DEPLOYMENT.md      # Deployment documentation
```

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Deployment
- `npm run deploy` - Deploy to Google Cloud
- `bash docker-run.sh build` - Build Docker image
- `bash docker-run.sh start` - Start Docker container
- `docker-compose up -d` - Start with Docker Compose

## Environment Variables

Required environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Database Setup

The database schema is managed through Supabase migrations in `supabase/migrations/`.

Key tables:
- `profiles` - User profiles and admin status
- `user_trades` - Stock and options positions
- `stock_posts` - Community discussion posts
- `stock_votes` - Community sentiment voting
- `portfolio_goal` - Financial goal tracking

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT

## Disclaimer

**Nothing on this platform is financial advice.** All content represents personal opinions and trades. Always do your own research and make informed decisions. Investing involves risk and you could lose money.

---

Built with ❤️ for the community by someone trying to escape the 9-5
