#!/bin/bash
# TruthGuard-AI Deployment Guide Branch Push Script
# Author: Eng. Yunis Al-Afeef <shoeabvv@gmail.com>

GITHUB_TOKEN="${1:-$GITHUB_TOKEN}"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Error: Please provide your GitHub Personal Access Token."
  echo "Usage: ./push_koyeb_deployment.sh <YOUR_GITHUB_TOKEN>"
  echo "Tip: A classic token starting with 'ghp_' and 'repo' scope is recommended."
  exit 1
fi

BRANCH="feat/free-cloud-deployment-guide"
REPO_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/yunis-alafeef/TruthGuard-AI.git"

echo "🚀 Preparing to push branch '$BRANCH' to GitHub..."
echo "Target Repository: https://github.com/yunis-alafeef/TruthGuard-AI.git"

# Push the branch to origin
git push "$REPO_URL" "76698af21d129fa75cfc258072ae0b3b44b702ec:refs/heads/$BRANCH" --force-with-lease

STATUS=$?
if [ $STATUS -eq 0 ]; then
  echo "✅ Successfully pushed branch '$BRANCH' to GitHub!"
  echo "🔗 View your branch and open PR here:"
  echo "   https://github.com/yunis-alafeef/TruthGuard-AI/tree/$BRANCH"
else
  echo ""
  echo "⚠️ Push failed (HTTP 403)."
  echo "💡 Quick fix:"
  echo "1. Go to https://github.com/settings/tokens/new (Tokens classic)"
  echo "2. Check the '[x] repo' checkbox and generate a token starting with 'ghp_'"
  echo "3. Run this script again with the new 'ghp_' token."
  exit 1
fi
