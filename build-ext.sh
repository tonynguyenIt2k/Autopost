#!/bin/bash
# =============================================
# FBTool Extension Build & Obfuscation Script
# =============================================
# This script:
# 1. Obfuscates background.js and content.js
# 2. Packages everything into a .zip for distribution
# =============================================

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXT_SRC="$SCRIPT_DIR/ext"
BUILD_DIR="$SCRIPT_DIR/ext-build"
OUTPUT_DIR="$SCRIPT_DIR/ext-download"

echo "🔧 FBTool Extension Builder"
echo "=========================="

# Check source exists
if [ ! -d "$EXT_SRC" ]; then
    echo "❌ Extension source directory not found: $EXT_SRC"
    exit 1
fi

# Install javascript-obfuscator if not available
if ! npx --no -- javascript-obfuscator --version &>/dev/null; then
    echo "📦 Installing javascript-obfuscator..."
    npm install --save-dev javascript-obfuscator -prefix "$SCRIPT_DIR"
fi

# Clean build directory
echo "🧹 Cleaning build directory..."
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
mkdir -p "$OUTPUT_DIR"

# Copy non-JS files
echo "📋 Copying manifest.json and icons..."
cp "$EXT_SRC/manifest.json" "$BUILD_DIR/"
if [ -d "$EXT_SRC/icons" ]; then
    cp -r "$EXT_SRC/icons" "$BUILD_DIR/"
fi

# Copy background.js directly (no obfuscation)
echo "📋 Copying background.js..."
cp "$EXT_SRC/background.js" "$BUILD_DIR/"

# Copy content.js directly (no obfuscation)
echo "📋 Copying content.js..."
cp "$EXT_SRC/content.js" "$BUILD_DIR/"

# Create ZIP package
echo "📦 Creating extension package..."
ZIP_FILE="$OUTPUT_DIR/fb-tool-ext.zip"
rm -f "$ZIP_FILE"
cd "$BUILD_DIR"
zip -r "$ZIP_FILE" . -x "*.DS_Store"
cd "$SCRIPT_DIR"

# Show results
echo ""
echo "=========================="
echo "✅ Build complete!"
echo "📁 Build directory: $BUILD_DIR"
echo "📦 Extension ZIP: $ZIP_FILE"
echo "📊 ZIP size: $(du -h "$ZIP_FILE" | cut -f1)"
echo ""
echo "To install the extension:"
echo "  1. Open chrome://extensions"
echo "  2. Enable 'Developer mode'"
echo "  3. Drag & drop the .zip file, or:"
echo "     - Unzip and click 'Load unpacked'"
echo "=========================="
