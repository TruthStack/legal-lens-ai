#!/bin/bash

# Deploy to Vercel Script

echo "🚀 Preparing Legal Lens AI for Vercel deployment..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Login to Vercel
echo "🔐 Logging into Vercel..."
vercel login

# Build project
echo "🏗️ Building project..."
npm run build

# Deploy
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at: https://legal-lens-ai.vercel.app"
