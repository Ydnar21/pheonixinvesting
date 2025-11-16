# Liquid Phoenix - Feature Documentation

## Personal Portfolio Management

Each user now has their own isolated portfolio with complete privacy and control.

### My Portfolio
- **Personal Trades Tracking**: Track your own stocks and options positions
  - View entry price, current price, and P&L calculations
  - Track options with expiration dates and strike prices
  - Add detailed due diligence notes
  - Set price targets and break-even prices
  - Mark earnings dates for upcoming announcements

- **Personal Financial Goal**: Set and track your journey to financial freedom
  - Define starting amount and target amount
  - Set target date for reaching your goal
  - Visual progress bar showing journey to financial freedom
  - Automatically calculates percentage progress

### Data Privacy & Isolation
- Each user can **only view and edit their own trades and goals**
- Admins can view all users' data for management purposes
- Row Level Security (RLS) ensures complete data isolation
- No user can access another user's portfolio data

---

## Market Calendar System

A collaborative calendar where the community tracks important market events and the admin approves submissions.

### For Regular Users

**Submit Events**
- Suggest market events (earnings, economic data, announcements, etc.)
- Mark as **Bullish** or **Bearish**
- Provide a title and description
- Set the date of the event
- Admins review and approve before event goes live

**View Calendar**
- See full year calendar with all approved events
- Color-coded events (green for bullish, red for bearish)
- Click on any date to view events for that day
- Search and filter events by sentiment and date

### For Admins

**Admin Panel**
- Access to "Manage Events" in admin section
- Review pending user submissions
- Approve submissions to add to official calendar
- Reject inappropriate or duplicate submissions
- Create events directly (bypass user submission queue)
- Edit or delete existing calendar events

**Event Moderation**
- See all pending submissions with user details
- Quick approve/reject interface
- Track which events came from users vs admin
- Maintain calendar quality and accuracy

---

## Portfolio Goal Tracking

Set a financial freedom goal and track progress.

### Goal Features
- **Set Your Goal**: Define starting capital and target amount
- **Timeline**: Set a target date for your goal
- **Progress Visualization**: See real-time progress with visual bar
- **Personal Tracking**: Each user has their own goal (one per user)
- **Editable**: Update your goal anytime as circumstances change

### How It Works
1. Click "My Goal" in Portfolio
2. Set your starting amount (default: $15,000)
3. Set your target amount (default: $100,000)
4. Set your target date
5. Track your portfolio value and watch progress grow

---

## Community Features (Existing)

### Investment Community
- **Discuss Stocks**: Share research and insights on specific stocks
- **Community Voting**: Vote on short-term and long-term sentiment
- **Comments & Discussion**: Engage with other investors
- **Moderation**: Admins manage posts and community quality

### Market News Feed
- Stay informed with latest market news
- Curated updates relevant to your interests

### About Page
- Learn about the platform mission
- Connect with like-minded investors

---

## Admin Features

### Trade Management
- **View All User Trades**: See portfolio data across all users
- **Add Trades**: Input positions on behalf of users if needed
- **Edit/Delete**: Manage the overall trade database

### Event Management
- Review and approve user-submitted calendar events
- Create official calendar events directly
- Manage the community calendar quality

### Stock Post Management
- Approve/reject user stock submissions
- Curate discussion topics

### User Management (via Supabase Console)
- Assign admin status to trusted users
- Monitor user activity
- Manage community guidelines enforcement

---

## Data Structure

### Personal Trades Table
```
user_trades
├── id (unique)
├── user_id (owner - RLS enforced)
├── symbol (stock ticker)
├── quantity
├── cost_basis (entry price)
├── current_price
├── trade_type (stock/option)
├── option details...
├── due diligence notes
└── timestamps
```

### Personal Goals Table
```
portfolio_goal
├── id (unique)
├── user_id (owner - one per user)
├── starting_amount
├── target_amount
├── target_date
└── timestamps
```

### Calendar Events Table
```
calendar_events
├── id (unique)
├── title
├── description
├── event_date
├── sentiment (bullish/bearish)
├── created_by (admin)
├── is_approved
└── timestamps
```

### Calendar Submissions Table
```
calendar_event_submissions
├── id (unique)
├── title
├── description
├── event_date
├── sentiment (bullish/bearish)
├── user_id (submitter)
├── status (pending/approved/rejected)
├── reviewed_by (admin)
└── timestamps
```

---

## Security Model

### Row Level Security (RLS)

**User Trades**
- Users can only SELECT/INSERT/UPDATE/DELETE their own trades
- Admins can access all trades

**Portfolio Goals**
- Users can only SELECT/INSERT/UPDATE/DELETE their own goal
- One goal per user enforced by unique constraint

**Calendar Events**
- Anyone can SELECT approved events
- Only admins can INSERT/UPDATE/DELETE events

**Calendar Submissions**
- Users can only SELECT/UPDATE their own submissions
- Admins can SELECT/UPDATE all submissions for review

### Authentication
- Supabase Auth handles authentication
- All queries run as authenticated user
- `auth.uid()` ensures user isolation

---

## User Workflows

### Regular User Workflow
1. **Login** to your account
2. **View Portfolio** → See your trades and personal goal
3. **Add Trades** → Input your positions
4. **Track Goal** → Monitor progress to financial freedom
5. **View Calendar** → See upcoming market events
6. **Submit Event** → Suggest a new calendar event
7. **Participate Community** → Discuss stocks, vote on sentiment

### Admin Workflow
1. **Login** to admin account
2. **Manage Trades** (optional) → View all user portfolios
3. **Calendar Admin** → Review pending submissions
4. **Approve/Reject** → Moderate calendar events
5. **Create Events** → Add direct calendar entries
6. **Community** → Manage posts and discussions

---

## Future Enhancements

- Portfolio performance analytics
- P&L tracking and reports
- Integration with market data APIs
- Watchlists and alerts
- Portfolio comparison tools
- Export functionality
- Mobile app
- Advanced filtering and search
- Calendar event notifications
- Community leaderboards

---

## Support & Issues

For problems or feature requests:
1. Check existing features in this documentation
2. Review database schema for data structure
3. Check admin panel for user submissions
4. Contact admin for moderation issues

## Remember

**This is NOT financial advice.** All users are responsible for their own investment decisions. Do your own research and invest wisely!
