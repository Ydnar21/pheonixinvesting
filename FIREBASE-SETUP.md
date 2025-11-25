# Firebase Setup Guide

This application now uses Firebase for authentication, database, and storage.

## Prerequisites

1. A Google account
2. Node.js and npm installed

## Setup Steps

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: "liquid-phoenix" (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Register Your Web App

1. In your Firebase project, click the web icon (</>) to add a web app
2. Register app with nickname: "Liquid Phoenix Web"
3. Check "Also set up Firebase Hosting" (optional)
4. Click "Register app"
5. Copy the Firebase configuration object

### 3. Configure Environment Variables

Update the `.env` file in your project root with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Enable Authentication

1. In Firebase Console, go to "Authentication" section
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### 5. Create Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode"
4. Select your preferred location
5. Click "Enable"

### 6. Deploy Firestore Security Rules

```bash
npm install -g firebase-tools
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

When prompted:
- Use an existing project: Select your Firebase project
- Firestore rules file: `firestore.rules`
- Firestore indexes file: Press Enter (default)

### 7. Enable Firebase Storage

1. In Firebase Console, go to "Storage"
2. Click "Get started"
3. Choose "Start in production mode"
4. Select same location as Firestore
5. Click "Done"

### 8. Deploy Storage Security Rules

```bash
firebase init storage
firebase deploy --only storage:rules
```

When prompted:
- Storage rules file: `storage.rules`

### 9. Create Admin User

After creating your first user account, you'll need to manually set them as admin:

1. Go to Firestore Database in Firebase Console
2. Find the `profiles` collection
3. Find your user document
4. Edit the document and add field: `is_admin: true`
5. Save the document

### 10. Set Up Firestore Indexes (if needed)

If you encounter index errors when running queries:

1. Click the error link in the browser console
2. It will open Firebase Console to create the required index
3. Wait for the index to build (usually takes a few minutes)

## Database Structure

The application uses the following Firestore collections:

- `profiles` - User profiles
- `stock_posts` - Community posts about stocks
- `post_comments` - Comments on posts
- `post_likes` - Likes on posts
- `comment_likes` - Likes on comments
- `stock_votes` - User votes on stocks (bullish/bearish)
- `stock_submissions` - User submitted stocks for admin approval
- `calendar_events` - Economic/market events
- `calendar_event_votes` - User votes on calendar events
- `direct_messages` - Private messages between users
- `user_follows` - User follow relationships
- `watchlist_stocks` - Approved stocks on the watchlist
- `watchlist_submissions` - User stock submissions for approval

## Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

## Deployment

The app is configured for Google Cloud Platform (App Engine). Update `app.yaml` if needed, then:

```bash
npm run deploy
```

## Security Notes

- Never commit your `.env` file to version control
- Keep your Firebase configuration secure
- Regularly review Firestore security rules
- Monitor Firebase usage in the Console
- Set up billing alerts to avoid unexpected charges

## Support

For Firebase-specific issues, consult:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Console](https://console.firebase.google.com/)
