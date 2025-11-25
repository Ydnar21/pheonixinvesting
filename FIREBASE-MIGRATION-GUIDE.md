# Firebase Migration Guide

This document explains how to complete the migration from Supabase to Firebase.

## Current Status

### ✅ Completed
- Firebase SDK installed
- Firebase configuration created (`src/lib/firebase.ts`)
- Firebase Auth context created (`src/context/FirebaseAuthContext.tsx`)
- Firebase Auth component created (`src/components/FirebaseAuth.tsx`)
- Firestore security rules defined (`firestore.rules`)
- Storage security rules defined (`storage.rules`)
- App.tsx updated to use Firebase authentication
- Environment variables configured for Firebase

### 🔄 Requires Manual Migration

The following components still use Supabase and need to be migrated to Firebase:

## Component Migration Pattern

### General Migration Steps

1. **Replace imports**
   ```typescript
   // Old (Supabase)
   import { supabase } from '../lib/supabase';

   // New (Firebase)
   import { db } from '../lib/firebase';
   import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
   ```

2. **Replace auth context**
   ```typescript
   // Old
   import { useAuth } from '../context/AuthContext';

   // New
   import { useAuth } from '../context/FirebaseAuthContext';
   ```

3. **Update queries**

### Supabase to Firebase Query Conversion

#### Reading Data

**Supabase:**
```typescript
const { data, error } = await supabase
  .from('stock_posts')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });
```

**Firebase:**
```typescript
const postsRef = collection(db, 'stock_posts');
const q = query(
  postsRef,
  where('user_id', '==', userId),
  orderBy('created_at', 'desc')
);
const snapshot = await getDocs(q);
const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
```

#### Creating Data

**Supabase:**
```typescript
const { data, error } = await supabase
  .from('stock_posts')
  .insert({
    user_id: userId,
    title: 'Test',
    content: 'Content'
  });
```

**Firebase:**
```typescript
const docRef = await addDoc(collection(db, 'stock_posts'), {
  user_id: userId,
  title: 'Test',
  content: 'Content',
  created_at: new Date()
});
```

#### Updating Data

**Supabase:**
```typescript
const { error } = await supabase
  .from('stock_posts')
  .update({ title: 'New Title' })
  .eq('id', postId);
```

**Firebase:**
```typescript
await updateDoc(doc(db, 'stock_posts', postId), {
  title: 'New Title',
  updated_at: new Date()
});
```

#### Deleting Data

**Supabase:**
```typescript
const { error } = await supabase
  .from('stock_posts')
  .delete()
  .eq('id', postId);
```

**Firebase:**
```typescript
await deleteDoc(doc(db, 'stock_posts', postId));
```

#### Joins / Related Data

**Supabase:**
```typescript
const { data } = await supabase
  .from('stock_posts')
  .select(`
    *,
    profiles:user_id (
      username,
      avatar_url
    )
  `);
```

**Firebase:**
```typescript
// Firebase doesn't support joins. You need separate queries:
const postsSnapshot = await getDocs(collection(db, 'stock_posts'));
const posts = postsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

// Get unique user IDs
const userIds = [...new Set(posts.map(p => p.user_id))];

// Fetch user profiles
const profiles = {};
for (const userId of userIds) {
  const userDoc = await getDoc(doc(db, 'profiles', userId));
  if (userDoc.exists()) {
    profiles[userId] = userDoc.data();
  }
}

// Merge data
const postsWithProfiles = posts.map(post => ({
  ...post,
  profiles: profiles[post.user_id]
}));
```

#### Real-time Updates

**Supabase:**
```typescript
const subscription = supabase
  .channel('stock_posts')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_posts' }, handleChange)
  .subscribe();
```

**Firebase:**
```typescript
import { onSnapshot } from 'firebase/firestore';

const unsubscribe = onSnapshot(
  collection(db, 'stock_posts'),
  (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        console.log('New: ', change.doc.data());
      }
      if (change.type === 'modified') {
        console.log('Modified: ', change.doc.data());
      }
      if (change.type === 'removed') {
        console.log('Removed: ', change.doc.data());
      }
    });
  }
);
```

## Components Requiring Migration

### 1. **Navbar.tsx**
- Update auth context import
- Update profile picture handling to use Firebase Storage

### 2. **ProfileModal.tsx**
- Update auth context import
- Migrate profile picture upload to Firebase Storage:
  ```typescript
  import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
  import { storage } from '../lib/firebase';

  const storageRef = ref(storage, `profile-pictures/${userId}/${file.name}`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  ```

### 3. **Messages.tsx**
- Migrate direct messages queries
- Implement real-time listener with `onSnapshot`

### 4. **Community.tsx**
- Migrate all stock posts queries
- Migrate comments, likes, votes
- Update to handle separate profile queries

### 5. **Watchlist.tsx**
- Migrate watchlist stocks queries
- Migrate watchlist submissions
- Update joins to separate queries

### 6. **WatchlistApproval.tsx**
- Migrate submission queries
- Update approval workflow

### 7. **Calendar.tsx**
- Migrate calendar events
- Migrate event votes

### 8. **News.tsx**
- Update to use Firebase if fetching from database
- Or keep as-is if using external API

### 9. **Strategy.tsx**
- Update any database queries if present

### 10. **AIBot.tsx**
- Update any database queries if present

### 11. **About.tsx**
- Likely no changes needed

## Firebase Cloud Functions

To replace Supabase Edge Functions, you'll need to set up Firebase Cloud Functions:

1. Initialize Functions:
   ```bash
   firebase init functions
   ```

2. Choose TypeScript

3. Create functions in `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const fetchMarketNews = functions.https.onRequest(async (req, res) => {
  // CORS
  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.status(204).send('');
    return;
  }

  // Your function logic here
  const news = await fetchNewsFromAPI();
  res.json(news);
});

// Add other functions...
```

4. Deploy:
   ```bash
   firebase deploy --only functions
   ```

## Data Migration

If you have existing data in Supabase, you'll need to:

1. Export data from Supabase:
   ```sql
   COPY (SELECT * FROM profiles) TO '/tmp/profiles.csv' CSV HEADER;
   ```

2. Write a migration script to import to Firestore:
   ```typescript
   import { initializeApp } from 'firebase-admin/app';
   import { getFirestore } from 'firebase-admin/firestore';

   const app = initializeApp();
   const db = getFirestore();

   async function migrateData() {
     const csvData = readCsv('profiles.csv');

     for (const row of csvData) {
       await db.collection('profiles').doc(row.id).set({
         username: row.username,
         email: row.email,
         is_admin: row.is_admin,
         created_at: new Date(row.created_at)
       });
     }
   }
   ```

## Testing Checklist

After migration, test:
- [ ] User registration
- [ ] User login
- [ ] Profile viewing and editing
- [ ] Profile picture upload
- [ ] Creating posts
- [ ] Commenting on posts
- [ ] Liking posts and comments
- [ ] Voting on stocks
- [ ] Submitting stocks to watchlist
- [ ] Admin approval of submissions
- [ ] Calendar events viewing
- [ ] Direct messaging
- [ ] Following users
- [ ] All admin functions

## Performance Considerations

Firebase Firestore has different performance characteristics than Supabase (PostgreSQL):

1. **No JOIN operations** - You need to denormalize data or make multiple queries
2. **Compound queries** - Limited to one array-contains or range filter per query
3. **Indexes** - You'll need to create composite indexes for complex queries
4. **Real-time** - Built-in but can consume more quota
5. **Pricing** - Based on reads/writes rather than bandwidth

## Cost Considerations

Firebase pricing differs from Supabase:
- Free tier: 50k reads, 20k writes, 1GB storage per day
- Storage: $0.18/GB/month
- Reads: $0.06 per 100k
- Writes: $0.18 per 100k

Monitor usage in Firebase Console.

## Rollback Plan

If migration issues occur:
1. Keep Supabase dependencies installed
2. Switch back to `AuthContext` and `supabase` imports
3. Revert `.env` to Supabase credentials
4. Git revert changes to components

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Model](https://firebase.google.com/docs/firestore/data-model)
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Cloud Functions](https://firebase.google.com/docs/functions)
