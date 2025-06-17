#!/bin/bash

# Deployment script for sourcemode-styling plugin
# Deploys built files to test vault

PLUGIN_NAME="sourcemode-styling"
TEST_VAULT_PATH="$HOME/Obsidian/Development/.obsidian/plugins/$PLUGIN_NAME"

# Check if main.js exists (built file)
if [ ! -f "main.js" ]; then
    echo "Error: main.js not found. Run 'npm run build' first."
    exit 1
fi

# Check if test vault directory exists
if [ ! -d "$TEST_VAULT_PATH" ]; then
    echo "Error: Test vault plugin directory not found at $TEST_VAULT_PATH"
    echo "Please ensure the test vault exists and the plugin directory is created."
    exit 1
fi

# Copy essential plugin files
echo "Deploying plugin files to test vault..."
cp main.js "$TEST_VAULT_PATH/"
cp manifest.json "$TEST_VAULT_PATH/"
cp styles.css "$TEST_VAULT_PATH/" 2>/dev/null || echo "No styles.css to copy"

echo "Deployment completed successfully to $TEST_VAULT_PATH"
echo "Restart Obsidian or reload the plugin to see changes."