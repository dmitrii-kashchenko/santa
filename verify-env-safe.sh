#!/bin/bash
# Script to verify .env files are not tracked by git

echo "🔍 Checking for .env files in git..."

# Check if .env (not .env.example) is tracked
if git ls-files | grep -q "^\.env$"; then
    echo "❌ ERROR: .env file is tracked by git!"
    echo "   Run: git rm --cached .env"
    exit 1
fi

# Check if .env is ignored
if git check-ignore -q .env; then
    echo "✅ .env is properly ignored by git"
else
    echo "❌ WARNING: .env is NOT in .gitignore!"
    exit 1
fi

# Check what will be committed (exclude .env.example which should be tracked)
echo ""
echo "📋 Checking for sensitive .env files (excluding .env.example):"
SENSITIVE_FILES=$(git status --porcelain | grep "\.env" | grep -v "\.env\.example")
if [ -n "$SENSITIVE_FILES" ]; then
    echo "⚠️  WARNING: Sensitive .env files found in git status!"
    echo "$SENSITIVE_FILES"
    exit 1
else
    echo "✅ No sensitive .env files in git status"
fi

echo ""
echo "✅ All checks passed! Safe to push."
