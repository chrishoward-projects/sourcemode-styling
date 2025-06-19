#!/bin/bash

# Release script for sourcemode-styling plugin
# Creates GitHub release with plugin files

set -e

PLUGIN_NAME="sourcemode-styling"

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "Error: There are uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "Creating release for version $CURRENT_VERSION"

# Ensure we have the required files
if [ ! -f "main.js" ]; then
    echo "Building plugin..."
    npm run build
fi

if [ ! -f "main.js" ]; then
    echo "Error: main.js not found after build"
    exit 1
fi

# Create git tag (without 'v' prefix)
echo "Creating git tag: $CURRENT_VERSION"
git tag "$CURRENT_VERSION"
git push origin-projects "$CURRENT_VERSION"

# Create release zip
ZIP_NAME="${PLUGIN_NAME}-${CURRENT_VERSION}.zip"
echo "Creating release zip: $ZIP_NAME"
zip -r "$ZIP_NAME" main.js manifest.json styles.css README.md LICENSE 2>/dev/null || true

# Create GitHub release using gh CLI
echo "Creating GitHub release..."
RELEASE_NOTES="Release v${CURRENT_VERSION}

See CHANGELOG.md for detailed changes."

gh release create "$CURRENT_VERSION" \
    --title "v${CURRENT_VERSION}" \
    --notes "$RELEASE_NOTES" \
    --draft \
    main.js manifest.json "$ZIP_NAME"

echo "Release created successfully!"
echo "- Tag: $CURRENT_VERSION"
echo "- Draft release created on GitHub"
echo "- Files uploaded: main.js, manifest.json, $ZIP_NAME"
echo ""
echo "Next steps:"
echo "1. Edit the release notes on GitHub"
echo "2. Publish the release when ready"

# Clean up zip file
rm -f "$ZIP_NAME"