#!/bin/bash
# TruthGuard-AI Sequential Push Script by Eng. Yunis Al-Afeef
# Pushes 11 developmental commits one by one to maximize GitHub contribution/activity record.

GITHUB_TOKEN="$1"

if [ -z "$GITHUB_TOKEN" ]; then
  echo "Usage: ./push_all_sequential.sh <YOUR_GITHUB_PERSONAL_ACCESS_TOKEN>"
  echo "Example: ./push_all_sequential.sh ghp_xxxxxx"
  exit 1
fi

REMOTE_URL="https://${GITHUB_TOKEN}@github.com/yunis-alafeef/TruthGuard-AI.git"

COMMITS=(
  "fd1da56"
  "483ad0a"
  "8bf2c8e"
  "f742284"
  "a2a811c"
  "9fecbcd"
  "b3212e3"
  "d2db7c9"
  "781ae3e"
  "c5378ed"
  "5f78a54"
)

echo "🚀 Starting sequential push of 11 commits to GitHub..."
echo "Repository: https://github.com/yunis-alafeef/TruthGuard-AI.git"
echo "Author: Yunis Al-Afeef <shoeabvv@gmail.com>"
echo "--------------------------------------------------------"

COUNT=1
for COMMIT in "${COMMITS[@]}"; do
  echo "📦 [$COUNT/11] Pushing commit $COMMIT to origin main..."
  git push "$REMOTE_URL" "$COMMIT:refs/heads/main" --force-with-lease
  STATUS=$?
  if [ $STATUS -eq 0 ]; then
    echo "✅ [$COUNT/11] Successfully pushed $COMMIT!"
  else
    echo "⚠️ Error pushing $COMMIT. Check token permissions (must have repo write access)."
    exit 1
  fi
  COUNT=$((COUNT + 1))
  echo "⏳ Waiting 3 seconds between pushes for GitHub activity logger..."
  sleep 3
done

echo "🎉 All 11 commits pushed successfully! Check https://github.com/yunis-alafeef/TruthGuard-AI"
