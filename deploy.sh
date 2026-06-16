#!/bin/bash
# =============================================
# FBTool Deploy Script for GitHub Pages
# =============================================
# This script:
# 1. Builds & obfuscates the extension
# 2. Copies web files to root for GitHub Pages
# 3. Initializes git and prepares for push
# =============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🚀 FBTool Deploy Script"
echo "=========================="
echo ""

# Step 1: Build extension
echo "📦 Step 1/3: Building & obfuscating extension..."
bash "$SCRIPT_DIR/build-ext.sh"
echo ""

# Step 2: Copy web files to root
echo "📋 Step 2/3: Copying web files to root for GitHub Pages..."

# Copy main HTML files
cp "$SCRIPT_DIR/web/index.html" "$SCRIPT_DIR/index.html"
cp "$SCRIPT_DIR/web/login.html" "$SCRIPT_DIR/login.html"
cp "$SCRIPT_DIR/web/admin.html" "$SCRIPT_DIR/admin.html"
cp "$SCRIPT_DIR/web/style.css" "$SCRIPT_DIR/style.css"

# Copy App.jsx if exists
if [ -f "$SCRIPT_DIR/web/App.jsx" ]; then
    cp "$SCRIPT_DIR/web/App.jsx" "$SCRIPT_DIR/App.jsx"
fi

# Copy assets
if [ -d "$SCRIPT_DIR/web/assets" ]; then
    rm -rf "$SCRIPT_DIR/assets"
    cp -r "$SCRIPT_DIR/web/assets" "$SCRIPT_DIR/assets"
fi

echo "✅ Web files copied to root"
echo ""

# Step 3: Git setup
echo "🔧 Step 3/3: Setting up Git..."

if [ ! -d "$SCRIPT_DIR/.git" ]; then
    cd "$SCRIPT_DIR"
    git init
    git branch -M main
    echo "✅ Git initialized"
else
    echo "ℹ️  Git already initialized"
fi

cd "$SCRIPT_DIR"
git add -A
git status

echo ""
echo "=========================="
echo "✅ Deploy preparation complete!"
echo ""
echo "📋 Next steps:"
echo "  1. Create a new GitHub repository"
echo "  2. Run these commands:"
echo "     git commit -m 'Initial deploy'"
echo "     git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
echo "     git push -u origin main"
echo ""
echo "  3. Go to GitHub repo → Settings → Pages"
echo "     - Source: Deploy from a branch"
echo "     - Branch: main, / (root)"
echo "     - Click Save"
echo ""
echo "  4. Your site will be at: https://YOUR_USERNAME.github.io/YOUR_REPO/"
echo "=========================="
