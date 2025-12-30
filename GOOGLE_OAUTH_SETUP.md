# Google OAuth Setup Guide for Quizzera

## Files Created/Modified

✅ **Created:**
- `/src/app/auth/callback/route.ts` - OAuth callback handler
- `/middleware.ts` - Auth state management and route protection

✅ **Modified:**
- `/src/components/LoginForm.tsx` - Added Google login button
- `/src/components/SignupForm.tsx` - Added Google signup button

---

## Setup Instructions

### Step 1: Configure Google OAuth Credentials

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create a New Project (or select existing):**
   - Click on the project dropdown at the top
   - Click "New Project"
   - Give it a name (e.g., "Quizzera")

3. **Enable OAuth Consent Screen:**
   - Go to "APIs & Services" → "OAuth consent screen"
   - Choose "External" (for testing with any Google account)
   - Fill in required fields:
     - App name: "Quizzera"
     - User support email: your email
     - Developer contact: your email
   - Click "Save and Continue"
   - Skip scopes for now
   - Add test users if needed (during development)

4. **Create OAuth Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**
   - Name: "Quizzera Web Client"
   
5. **Add Authorized Redirect URIs:**
   Add these URLs (replace with your actual domains):
   
   **For Development:**
   ```
   http://localhost:3000/auth/callback
   ```
   
   **For Production:**
   ```
   https://your-domain.com/auth/callback
   ```
   
   **For Supabase (Important!):**
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
   
   To find your Supabase project ref:
   - Go to your Supabase dashboard
   - Look at the URL: `https://supabase.com/dashboard/project/<project-ref>`
   - Or go to Settings → API → Project URL

6. **Copy Credentials:**
   - Copy the **Client ID**
   - Copy the **Client Secret**
   - Keep these safe!

---

### Step 2: Configure Supabase

1. **Go to your Supabase Dashboard:**
   - Navigate to: https://supabase.com/dashboard

2. **Enable Google Provider:**
   - Go to "Authentication" → "Providers"
   - Find "Google" in the list
   - Toggle it to "Enabled"

3. **Paste Google Credentials:**
   - Client ID: [paste from Google Console]
   - Client Secret: [paste from Google Console]

4. **Configure Redirect URLs (if needed):**
   - Site URL: `http://localhost:3000` (for development)
   - Redirect URLs: Add `http://localhost:3000/auth/callback`

5. **Save Configuration**

---

### Step 3: Test OAuth Flow

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to login page:**
   ```
   http://localhost:3000/auth
   ```

3. **Click "Login with Google"**
   - Should redirect to Google login
   - After successful login, should redirect to `/dashboard`

4. **Check browser console for errors**
   - If there are errors, check the steps above

---

## Common Issues & Solutions

### Issue 1: "Redirect URI mismatch"
**Solution:** Make sure the redirect URI in Google Console exactly matches:
```
http://localhost:3000/auth/callback (for local)
https://<your-domain>/auth/callback (for production)
```

### Issue 2: "OAuth client not found"
**Solution:** Double-check that:
- Client ID and Secret are correctly pasted in Supabase
- No extra spaces in the credentials

### Issue 3: Gets stuck on auth callback
**Solution:** Check:
- The callback route exists at `/src/app/auth/callback/route.ts`
- No errors in server console
- Cookies are enabled in browser

### Issue 4: "Access blocked: This app's request is invalid"
**Solution:** 
- Make sure OAuth consent screen is properly configured
- Add your email as a test user during development
- Publish the app (not required for testing, but helpful)

---

## How It Works

### 1. User clicks "Login with Google"
```typescript
handleGoogleLogin() → supabase.auth.signInWithOAuth({
  provider: 'google',
  redirectTo: '/auth/callback'
})
```

### 2. User is redirected to Google
- Google handles authentication
- User grants permission

### 3. Google redirects back with code
```
http://localhost:3000/auth/callback?code=XXXXX
```

### 4. Callback route exchanges code for session
```typescript
// In /auth/callback/route.ts
supabase.auth.exchangeCodeForSession(code)
```

### 5. User is redirected to dashboard
- Session is now established
- User can access protected routes

---

## Security Features Implemented

✅ **Middleware Protection:**
- Unauthenticated users can't access protected routes
- Authenticated users are redirected away from login page

✅ **Secure Token Exchange:**
- OAuth code is exchanged server-side
- No tokens exposed to client

✅ **Cookie Management:**
- Supabase handles secure cookie storage
- Automatic token refresh

---

## Testing Checklist

- [ ] Google OAuth button appears on login page
- [ ] Clicking button redirects to Google login
- [ ] After Google login, redirects back to app
- [ ] User session is established (check AuthProvider)
- [ ] User can access dashboard
- [ ] User can logout and login again
- [ ] Both signup and login work with Google
- [ ] Email/password login still works

---

## Production Deployment

Before deploying to production:

1. **Update redirect URIs in Google Console:**
   - Add your production domain
   - Remove localhost (or keep for testing)

2. **Update Supabase site URL:**
   - Go to Authentication → URL Configuration
   - Set site URL to your production domain

3. **Environment Variables:**
   Make sure these are set:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Test OAuth flow on production:**
   - Test with multiple Google accounts
   - Test signup vs login flow
   - Test on different browsers/devices

---

## Additional OAuth Providers

Want to add more providers? Here's how:

### GitHub
1. Enable GitHub provider in Supabase
2. Create OAuth app on GitHub
3. Add same callback handling (already done!)
4. Add button in LoginForm/SignupForm

### Apple
1. Requires Apple Developer account ($99/year)
2. More complex setup with app IDs
3. Required for App Store submission

### Microsoft
1. Good for enterprise/education apps
2. Similar setup to Google
3. Uses Azure AD

---

## Support

If you run into issues:
1. Check Supabase logs (Dashboard → Logs)
2. Check browser console
3. Check server console (terminal)
4. Verify all credentials are correct
5. Try clearing cookies and cache

---

## Next Steps

After OAuth is working:
1. Add user preferences table (already in schema!)
2. Create welcome flow for new users
3. Add profile picture from Google
4. Implement "Login with GitHub" or other providers
5. Add email verification for email/password signups
