# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build for development**: `npm run dev` (runs esbuild in watch mode)
- **Build for production**: `npm run build` (type checks then builds with minification)
- **Lint**: Use eslint with the configured .eslintrc (TypeScript ESLint rules)
- **Version bump**: `npm run version` (updates manifest.json and versions.json)

## Architecture Overview

This is an Obsidian plugin that customizes the appearance of source mode editing with monospace fonts and styling options.

### Core Structure

- **Main plugin class** (`src/main.ts`): `SourceModeStyling` extends Obsidian's `Plugin` class
  - Manages CSS injection via dynamic `<style>` elements with ID `sourcemode-styling-font-style`
  - Adds/removes `obsidian-mode-raw` class to document body based on active view state
  - Listens to workspace events (`active-leaf-change`, `layout-change`) to update styling

- **Settings system** (`src/settingsTab.ts` + `src/settings/`): Modular settings architecture
  - Each setting type has its own file (FontFamilySetting.ts, FontSizeSetting.ts, etc.)
  - Settings tab imports and adds each setting component individually
  - Font detection utility (`src/fontDetect.ts`) detects available monospace fonts

### Key Plugin Mechanics

- **CSS Targeting**: Styles target `.obsidian-mode-raw .markdown-source-view.mod-cm6` selectors
- **Dynamic Styling**: CSS is generated and injected based on current settings values
- **State Management**: Plugin tracks styling state with `styleListenersRegistered` flag
- **View State Detection**: Checks if current view is MarkdownView in source mode to apply styling

### Build Configuration

- Uses esbuild for bundling (`esbuild.config.mjs`)
- Entry point: `src/main.ts` → output: `main.js`
- External dependencies include Obsidian API and CodeMirror modules
- Development builds include inline source maps, production builds are minified