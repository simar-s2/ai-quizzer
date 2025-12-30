# OAuth Localhost Redirect Issue - Troubleshooting Guide

## 🔍 Problem
When logging in with Google on your production site (quizzera.com), you're being redirected to `http://localhost:3000` instead of staying on your production domain.

---

## ✅ Code Fix Applied

**File: `/src/app/auth/callback/route.ts`**

**Changed:**
```typescript
// OLD - This could preserve localhost from referrer
return NextResponse.redirect(new URL(next, request.url))
```

**To:**
```typescript
// NEW - This uses the current request's origin
const origin = requestUrl.origin
return NextResponse.redirect(new URL(next, origin))
```

**Why this fixes it:**
- `request.url` might include localhost if that's where the OAuth flow started
- `requestUrl.origin` uses the actual domain where the callback is being processed
- Ensures redirect happens on the same domain as the callback

---

## 🔧 Troubleshooting Steps

### **Step 1: Check Google OAuth Console**

Go to [Google Cloud Console](https://console.cloud.google.com/) → Credentials → Your OAuth Client

**Verify Authorized Redirect URIs includes:**
```
✅ https://quizzera.com/auth/callback
✅ https://[your-ref].supabase.co/auth/v1/callback
❌ http://localhost:3000/auth/callback  (REMOVE THIS for production)
```

**Action Required:**
If localhost is still there:
1. Remove `http://localhost:3000/auth/callback` from production OAuth client
2. OR create a separate OAuth client for production (recommended)

---

### **Step 2: Check Supabase Configuration**

Go to [Supabase Dashboard](https://supabase.com/dashboard) → Authentication → URL Configuration

**Check these settings:**

1. **Site URL:**
   ```
   Current: _________________
   Should be: https://quizzera.com
   ```

2. **Redirect URLs (under Additional Redirect URLs):**
   ```
   ✅ https://quizzera.com/**
   ✅ https://quizzera.com/auth/callback
   
   ❌ Remove: http://localhost:3000/**
   ❌ Remove: http://localhost:3000/auth/callback
   ```

**How to update:**
- Authentication → URL Configuration
- Update Site URL to `https://quizzera.com`
- Remove all localhost URLs from Redirect URLs list
- Click Save

---

### **Step 3: Check Environment Variables**

**On your production deployment (Vercel/Netlify/etc):**

Verify these environment variables are set correctly:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
GOOGLE_API_KEY=your-google-api-key

# Make sure there's NO localhost references in environment variables
```

**Where to check:**
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Other platforms: Check their environment variable settings

---

### **Step 4: Clear Browser Cache & Cookies**

Google OAuth and browsers can cache redirect URLs.

**Do this:**
1. Open Developer Tools (F12)
2. Right-click the Refresh button → "Empty Cache and Hard Reload"
3. OR go to Settings → Clear browsing data:
   - Cookies and site data ✅
   - Cached images and files ✅
   - Time range: All time
4. Close all browser tabs with your site
5. Try again in a new incognito/private window

---

### **Step 5: Test the OAuth Flow Manually**

**Add console logs to track the flow:**

**In LoginForm.tsx:**
```typescript
const handleGoogleLogin = async () => {
  console.log('🔵 Starting OAuth from origin:', window.location.origin)
  setLoading(true);
  setError("");
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  console.log('🔵 RedirectTo URL:', `${window.location.origin}/auth/callback`)
  if (error) {
    console.error('❌ OAuth Error:', error)
    setError(error.message);
    setLoading(false);
  }
};
```

**In callback route.ts:**
```typescript
export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  console.log('🟢 Callback received at:', requestUrl.href)
  console.log('🟢 Request origin:', requestUrl.origin)
  
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'
  
  console.log('🟢 Redirect code:', code ? 'Present' : 'Missing')
  console.log('🟢 Next parameter:', next)

  // ... rest of the code

  const origin = requestUrl.origin
  console.log('🟢 Final redirect:', new URL(next, origin).href)
  return NextResponse.redirect(new URL(next, origin))
}
```

**Check the browser console and server logs to see the flow.**

---

### **Step 6: Verify Deployment**

**Make sure the code changes are actually deployed:**

```bash
# If using Vercel
vercel --prod

# If using Netlify  
netlify deploy --prod

# If using other platforms
# Make sure you've committed and pushed the changes
git add .
git commit -m "Fix OAuth redirect to use current origin"
git push origin main
```

**Then verify the deployment:**
1. Go to your deployment platform
2. Check the deployment logs
3. Verify the latest commit is deployed
4. Check the build succeeded

---

### **Step 7: Test the Full Flow**

**Do this step by step:**

1. **Clear everything:**
   - Clear browser cache
   - Clear cookies
   - Close all tabs
   - Sign out from Google

2. **Open incognito window:**
   - Go to `https://quizzera.com/auth`
   - Open Developer Console (F12)
   - Go to Network tab

3. **Click "Login with Google":**
   - Watch the Network tab
   - You should see redirects in this order:
     ```
     https://quizzera.com/auth
     → https://[your-ref].supabase.co/auth/v1/authorize
     → https://accounts.google.com/o/oauth2/...
     → (Google login)
     → https://[your-ref].supabase.co/auth/v1/callback
     → https://quizzera.com/auth/callback
     → https://quizzera.com/dashboard
     ```

4. **Check for localhost:**
   - If you see `http://localhost:3000` anywhere in the Network tab
   - Take a screenshot and note which step shows localhost

---

## 🎯 Most Likely Causes

Based on your description, the issue is likely one of these:

### **Cause 1: Supabase Site URL Still Set to Localhost** ⭐ MOST COMMON
- Go to Supabase → Authentication → URL Configuration
- Change Site URL from `http://localhost:3000` to `https://quizzera.com`
- Remove localhost from Redirect URLs

### **Cause 2: Google OAuth Client Still Has Localhost**
- Go to Google Cloud Console → Credentials
- Edit your OAuth client
- Remove `http://localhost:3000/auth/callback`
- Keep only `https://quizzera.com/auth/callback` and Supabase callback

### **Cause 3: Browser Cache**
- Browsers cache OAuth redirects aggressively
- Must clear cache and test in incognito

### **Cause 4: Wrong OAuth Client in Production**
- You might be using development OAuth credentials in production
- Check environment variables are set correctly on deployment platform

### **Cause 5: Code Not Deployed**
- Changes haven't been deployed to production
- Verify latest commit is live

---

## 🔬 Advanced Debugging

If none of the above works, check these:

### **Check Supabase Logs**
1. Go to Supabase Dashboard
2. Logs → Auth Logs
3. Look for OAuth attempts
4. Check what redirect_uri is being sent

### **Check Headers**
In the callback route, log all headers:
```typescript
export async function GET(request: Request) {
  console.log('Headers:', Object.fromEntries(request.headers))
  console.log('Referer:', request.headers.get('referer'))
  console.log('Origin:', request.headers.get('origin'))
  console.log('Host:', request.headers.get('host'))
  // ... rest of code
}
```

### **Check URL Parameters**
```typescript
export async function GET(request: Request) {
  const url = new URL(request.url)
  console.log('All params:', Object.fromEntries(url.searchParams))
  // ... rest of code
}
```

---

## ✅ Verification Checklist

After making changes, verify:

- [ ] Code deployed to production
- [ ] Supabase Site URL is `https://quizzera.com` (not localhost)
- [ ] Supabase Redirect URLs don't include localhost
- [ ] Google OAuth Client doesn't have localhost (or using separate client)
- [ ] Environment variables are correct in production
- [ ] Browser cache cleared
- [ ] Tested in incognito window
- [ ] Can successfully log in and stay on quizzera.com

---

## 📞 Still Not Working?

If you're still having issues after all these steps:

1. **Share the console logs** from the OAuth flow
2. **Share the Network tab** showing the redirect chain
3. **Share your Supabase URL Configuration** (screenshot)
4. **Share your Google OAuth Client redirect URIs** (screenshot)

This will help identify exactly where in the flow it's going wrong.

---

## 🎉 Success!

If it's working now, you should see:
```
✅ Click "Login with Google" on quizzera.com
✅ Redirected to Google login
✅ After login, redirected back to quizzera.com/dashboard
✅ No localhost anywhere in the URL bar
```

Great job! 🚀
