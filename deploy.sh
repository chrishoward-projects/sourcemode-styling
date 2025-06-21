#!/bin/bash

# Deploy script for Related Notes by Tag plugin
# Copies built files to active Obsidian vault

USER_HOME="$HOME"
DEV_VAULT="Development"
TARGET_VAULT="APRIL"
SOURCE_DIR="$USER_HOME/Obsidian/$DEV_VAULT/.obsidian/plugins/sourcemode-styling"
TARGET_DIR="$USER_HOME/Obsidian/$TARGET_VAULT/.obsidian/plugins/sourcemode-styling"

# Check if target directory exists, exit if it doesn't
if [[ ! -d "$TARGET_DIR" ]]; then
    echo "Error: Target directory does not exist: $TARGET_DIR"
    exit 1
fi

# Copy files
cp "$SOURCE_DIR/main.js" "$TARGET_DIR/"
cp "$SOURCE_DIR/manifest.json" "$TARGET_DIR/"
cp "$SOURCE_DIR/styles.css" "$TARGET_DIR/"

echo "Plugin files deployed to $TARGET_DIR"