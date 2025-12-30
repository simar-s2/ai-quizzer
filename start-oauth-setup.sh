#!/bin/bash

# Quizzera OAuth Setup Quick Start
# Run this after setting up Google OAuth credentials

echo "🚀 Quizzera OAuth Setup Quick Start"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ Error: .env.local not found!"
    echo "Please create .env.local with your Supabase credentials:"
    echo ""
    echo "NEXT_PUBLIC_SUPABASE_URL=your-supabase-url"
    echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key"
    echo "GOOGLE_API_KEY=your-google-api-key"
    echo ""
    exit 1
fi

echo "✅ Environment file found"
echo ""

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "📋 Setup Checklist:"
echo ""
echo "Before running the app, make sure you've completed these steps:"
echo ""
echo "1. Database Setup:"
echo "   ☐ Run the main schema SQL in Supabase SQL Editor"
echo "   ☐ Run USER_PREFERENCES_TRIGGER.sql in Supabase SQL Editor"
echo ""
echo "2. Google OAuth Setup (see GOOGLE_OAUTH_SETUP.md for details):"
echo "   ☐ Created Google OAuth credentials"
echo "   ☐ Added redirect URI: http://localhost:3000/auth/callback"
echo "   ☐ Added redirect URI: https://<project-ref>.supabase.co/auth/v1/callback"
echo "   ☐ Pasted Client ID into Supabase → Authentication → Providers → Google"
echo "   ☐ Pasted Client Secret into Supabase → Authentication → Providers → Google"
echo "   ☐ Enabled Google provider in Supabase"
echo ""
echo "3. Verify environment variables in .env.local:"
echo "   ☐ NEXT_PUBLIC_SUPABASE_URL"
echo "   ☐ NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   ☐ GOOGLE_API_KEY (for quiz generation)"
echo ""

read -p "Have you completed all the steps above? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "Please complete the setup steps first!"
    echo "See GOOGLE_OAUTH_SETUP.md for detailed instructions."
    exit 1
fi

echo ""
echo "🎉 Great! Starting the development server..."
echo ""
echo "Your app will be available at:"
echo "👉 http://localhost:3000"
echo ""
echo "Test OAuth by:"
echo "1. Navigate to http://localhost:3000/auth"
echo "2. Click 'Login with Google'"
echo "3. Verify redirect to dashboard after login"
echo ""

# Start the dev server
npm run dev
