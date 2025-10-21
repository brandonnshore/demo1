# OAuth Setup Guide (Google & Apple Sign-In)

## ✅ What's Been Implemented

I've added **Google** and **Apple** sign-in buttons to your Login and Register pages. The code is ready - you just need to configure the OAuth providers in your Supabase dashboard.

## 🔧 Supabase Configuration Required

### Step 1: Get Your Supabase Anon Key

1. Go to https://supabase.com/dashboard/project/xezmvslgaclidlkpkkuc
2. Click on **Settings** (gear icon in sidebar)
3. Click on **API**
4. Copy the `anon` `public` key
5. Update `frontend/.env` file:
   ```
   VITE_SUPABASE_ANON_KEY=your_copied_anon_key_here
   ```

### Step 2: Enable Google OAuth

1. Go to https://supabase.com/dashboard/project/xezmvslgaclidlkpkkuc/auth/providers
2. Find **Google** in the providers list
3. Click **Enable**
4. **Get Google OAuth Credentials:**
   - Go to https://console.cloud.google.com/
   - Create a new project or select existing one
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URI:
     ```
     https://xezmvslgaclidlkpkkuc.supabase.co/auth/v1/callback
     ```
   - Copy the **Client ID** and **Client Secret**
5. **Back in Supabase:**
   - Paste the **Client ID** and **Client Secret**
   - Click **Save**

### Step 3: Enable Apple Sign In

1. Still in https://supabase.com/dashboard/project/xezmvslgaclidlkpkkuc/auth/providers
2. Find **Apple** in the providers list
3. Click **Enable**
4. **Get Apple OAuth Credentials:**
   - Go to https://developer.apple.com/account/resources/identifiers/list
   - Sign in with your Apple Developer account ($99/year required)
   - Click the **+** button to create a new identifier
   - Select **Services ID** and click Continue
   - Configure your Services ID:
     - Description: "Raspberry OAuth"
     - Identifier: com.raspberry.oauth (or your bundle ID)
   - Enable **Sign In with Apple**
   - Configure Web Domain and Return URLs:
     ```
     Domain: xezmvslgaclidlkpkkuc.supabase.co
     Return URL: https://xezmvslgaclidlkpkkuc.supabase.co/auth/v1/callback
     ```
   - Download the private key (.p8 file)
5. **Back in Supabase:**
   - Paste your **Services ID** (Client ID)
   - Paste your **Team ID** (found in Apple Developer account)
   - Paste your **Key ID** (found when you download the .p8 file)
   - Paste the contents of your **.p8 private key**
   - Click **Save**

### Step 4: Configure Redirect URLs in Supabase

1. Go to https://supabase.com/dashboard/project/xezmvslgaclidlkpkkuc/auth/url-configuration
2. Add these redirect URLs (one per line):
   ```
   http://localhost:3002/auth/callback
   https://yourdomain.com/auth/callback
   ```
3. Click **Save**

## 🧪 Testing OAuth Locally

1. Make sure your `.env` file has the correct Supabase URL and Anon Key
2. Restart your frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```
3. Visit http://localhost:3002/login or http://localhost:3002/register
4. Click **Continue with Google** or **Continue with Apple**
5. Complete the OAuth flow
6. You'll be redirected to `/auth/callback` then to `/dashboard`

## 📝 Important Notes

### For Google OAuth:
- **Free** - No developer account fee
- Works immediately after setup
- Requires verified domain for production
- Test with personal Gmail accounts during development

### For Apple Sign In:
- **Requires Apple Developer Account** ($99/year)
- Must have a registered domain
- More complex setup process
- Recommended for iOS apps and professional websites

## 🚨 If You Don't Have an Apple Developer Account

You can **skip Apple Sign In for now** and just use Google OAuth. Users will still see the Apple button but it won't work until you:
1. Get an Apple Developer account
2. Complete the Apple OAuth setup above

To hide the Apple button until you're ready:
1. Open `frontend/src/pages/Login.tsx`
2. Comment out or remove the Apple button (lines 79-88)
3. Do the same in `frontend/src/pages/Register.tsx` (lines 88-97)

## ✨ How It Works

When users click "Continue with Google" or "Continue with Apple":

1. **OAuth Popup** opens with Google/Apple login
2. User grants permission
3. **Redirected** to `/auth/callback`
4. **Backend syncs** user with our database
5. **Redirected** to `/dashboard`
6. User is now logged in! 🎉

## 🔐 Security

- OAuth tokens are managed by Supabase
- Your backend JWT tokens are still used for API authentication
- Users created via OAuth have a special marker in the database
- All sensitive credentials are stored server-side only

## 🐛 Troubleshooting

### "Invalid redirect URI" error
- Make sure you added the exact redirect URL in Google/Apple console
- Format: `https://xezmvslgaclidlkpkkuc.supabase.co/auth/v1/callback`

### "Failed to sign in" error
- Check browser console for detailed error
- Verify Supabase anon key is correct in `.env`
- Make sure OAuth provider is **enabled** in Supabase dashboard

### OAuth popup doesn't open
- Check if popup blockers are enabled
- Try in incognito mode
- Verify Supabase URL is correct

## 📧 Email/Password Still Works!

Users can still register and login with email/password. The OAuth buttons are just an additional option for easier sign-in.

---

**Need Help?** Check Supabase docs: https://supabase.com/docs/guides/auth/social-login
