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

# Obfuscate background.js
echo "🔐 Obfuscating background.js (this may take a moment)..."
npx --yes javascript-obfuscator "$EXT_SRC/background.js" \
    --output "$BUILD_DIR/background.js" \
    --compact true \
    --control-flow-flattening true \
    --control-flow-flattening-threshold 0.5 \
    --dead-code-injection true \
    --dead-code-injection-threshold 0.2 \
    --identifier-names-generator hexadecimal \
    --rename-globals false \
    --self-defending true \
    --string-array true \
    --string-array-calls-transform true \
    --string-array-encoding 'rc4' \
    --string-array-threshold 0.75 \
    --string-array-rotate true \
    --string-array-shuffle true \
    --split-strings true \
    --split-strings-chunk-length 5 \
    --transform-object-keys true \
    --unicode-escape-sequence true \
    --target browser-no-eval

echo "✅ background.js obfuscated"

# Obfuscate content.js
echo "🔐 Obfuscating content.js..."
npx --yes javascript-obfuscator "$EXT_SRC/content.js" \
    --output "$BUILD_DIR/content.js" \
    --compact true \
    --control-flow-flattening true \
    --control-flow-flattening-threshold 0.5 \
    --dead-code-injection true \
    --dead-code-injection-threshold 0.2 \
    --identifier-names-generator hexadecimal \
    --rename-globals false \
    --self-defending true \
    --string-array true \
    --string-array-calls-transform true \
    --string-array-encoding 'rc4' \
    --string-array-threshold 0.75 \
    --string-array-rotate true \
    --string-array-shuffle true \
    --split-strings true \
    --split-strings-chunk-length 5 \
    --transform-object-keys true \
    --unicode-escape-sequence true \
    --target browser-no-eval

echo "✅ content.js obfuscated"

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
