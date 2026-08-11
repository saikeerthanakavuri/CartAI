# Firebase Setup Guide for CartAI

## Quick Setup (5 minutes)

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it "CartAI" (or your preferred name)
4. Click "Create project"
5. Wait for initialization to complete

### 2. Enable Authentication
1. In Firebase Console, go to **Build > Authentication**
2. Click **Get started**
3. Enable these sign-in methods:
   - Email/Password
   - Google

### 3. Get Your Firebase Config
1. Go to **Project Settings** (gear icon)
2. Click on **Your apps > Web app** (or create a web app if needed)
3. Copy the Firebase config object
4. You'll see something like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "cartai-xxx.firebaseapp.com",
  projectId: "cartai-xxx",
  storageBucket: "cartai-xxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 4. Add Config to Your App
1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Firebase config values:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=cartai-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cartai-xxx
VITE_FIREBASE_STORAGE_BUCKET=cartai-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

3. Restart your dev server:
```bash
npm run dev
```

## How It Works

### Authentication Flow
1. User lands on the app → sees Firebase login screen
2. User can:
   - Sign up with email/password
   - Sign in with existing account
   - Sign in with Google
3. After auth → shown dashboard with their email
4. Click "Sign Out" → back to login screen

### User Data
- User credentials stored in Firebase
- User's email displayed in dashboard header
- Session persists across page refreshes
- Perfect for hackathon judges to test multiple accounts!

## Testing

### Create Test Accounts
1. Click "Sign up" on login screen
2. Use email: `test@example.com`, password: `password123`
3. Create another: `shopkeeper@cartai.com`, password: `password123`
4. Try Google sign-in to show OAuth integration

### What Judges Will See
- Real login/signup flow
- Authenticated user sessions
- Email displayed in dashboard
- Security best practices implemented
- Ready for production scale-up

## Troubleshooting

### "API key not valid" error
- Check `.env.local` has correct Firebase keys
- Make sure `.env.local` is in the root directory (not src/)
- Restart dev server after updating `.env.local`

### Login not working
- Check Firebase Console > Authentication > Sign-in methods are enabled
- Try creating a test account in Firebase Console first

### Google sign-in fails
- In Firebase > Authentication > Google, you need to add authorized domains
- Add your dev domain (usually `localhost:5173`)
- Add your production domain later

## Production Checklist
- [ ] Set up backend to sync user data
- [ ] Add Firebase rules to secure data
- [ ] Set up WhatsApp API integration
- [ ] Store shop details per user
- [ ] Sync products to Firestore per user
