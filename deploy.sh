#!/bin/bash
# ================================================================
# COMPANY INTEL TRACKER — GitHub + Vercel Setup Script
# Run this on your LOCAL machine (Windows WSL / Ubuntu)
# ================================================================

set -e

GITHUB_USER="NAVEED261"
REPO_NAME="company-intel-tracker"
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"  # Replace with your GitHub PAT

echo "🚀 Step 1: Creating GitHub repo..."
curl -s -X POST https://api.github.com/user/repos \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"Real-time company headline intelligence tracker powered by Tavily AI\",
    \"private\": false,
    \"auto_init\": false
  }" | grep '"full_name"'

echo ""
echo "✅ Repo created: https://github.com/$GITHUB_USER/$REPO_NAME"

echo ""
echo "🔗 Step 2: Pushing code..."
cd company-intel-tracker
git remote add origin "https://$GITHUB_TOKEN@github.com/$GITHUB_USER/$REPO_NAME.git"
git branch -M main
git push -u origin main

echo ""
echo "✅ Code pushed to GitHub!"

echo ""
echo "🌐 Step 3: Deploying to Vercel..."
echo "Run these commands:"
echo ""
echo "  npm install -g vercel"
echo "  vercel login"
echo "  cd company-intel-tracker"
echo "  vercel --prod"
echo "  # When prompted, set env var: TAVILY_API_KEY=tvly-xxxx"
echo ""
echo "🎯 Get your Tavily API key at: https://app.tavily.com/sign-in"
echo "🎯 Get your GitHub PAT at: https://github.com/settings/tokens"
