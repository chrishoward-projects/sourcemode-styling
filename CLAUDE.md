# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build for development**: `npm run dev` (runs esbuild in watch mode)
- **Build for production**: `npm run build` (type checks, builds with minification, and deploys to test vault)
- **Lint**: `npm run lint` (ESLint with TypeScript rules)
- **Deploy**: `npm run deploy` (copy built files to test vault)
- **Version management**: `npm run update-version` (bump version, update files, build, and commit in one step)
- **Release**: `npm run release` (create GitHub release - manual when ready)

### Version Management Workflow
- Use `npm run update-version` instead of `npm version patch` (prevents dual commits)
- Updates package.json, manifest.json, versions.json, CHANGELOG.md
- Automatically builds plugin and stages all changes
- Creates single clean commit with all version-related changes

## Architecture Overview

This is an Obsidian plugin that customizes the appearance of source mode editing with monospace fonts and styling options.

### Core Structure

- **Main plugin class** (`src/main.ts`): `SourceModeStyling` extends Obsidian's `Plugin` class
  - Manages CSS injection via dynamic `<style>` elements with ID `sourcemode-styling-font-style`
  - Adds/removes `.source-mode-raw` class to document body based on active view state
  - Listens to workspace events (`active-leaf-change`, `layout-change`) to update styling

- **Settings system** (`src/settingsTab.ts` + `src/settings/`): Modular settings architecture
  - Each setting type has its own file (FontFamilySetting.ts, FontSizeSetting.ts, etc.)
  - Settings tab imports and adds each setting component individually
  - Font detection utility (`src/fontDetect.ts`) detects available monospace fonts

### Key Plugin Mechanics

- **CSS Targeting**: Styles target `.source-mode-raw .markdown-source-view.mod-cm6` selectors
- **Dynamic Styling**: CSS is generated and injected based on current settings values
- **State Management**: Plugin tracks styling state with `styleListenersRegistered` flag
- **View State Detection**: Checks if current view is MarkdownView in source mode to apply styling

### Development Notes

- Plugin targets ES2018 and uses CommonJS format for Obsidian compatibility
- External Obsidian APIs are marked as external in the build process
- Uses TypeScript with strict null checks and inline source maps for development
- Refer always to Obsidian Developer Dcoumentation @https://github.com/obsidianmd/obsidian-developer-docs

### Obsidian Submission Compliance

When making changes, ensure compliance with Obsidian submission guidelines:
- **Security**: Use DOM API or DOMParser instead of innerHTML/outerHTML
- **Styling**: Move inline styles to CSS files for better theme compatibility
- **Commands**: Don't include plugin name in command names
- **Lifecycle**: Never detach leaves in onunload() method
- **Policies**: Ensure compliance with Obsidian Developer Policies @https://github.com/obsidianmd/obsidian-developer-docs
- **Guidelines**: Ensure compliance with Obsidian Plugin Guidelines @https://github.com/obsidianmd/obsidian-developer-docs


### Version Management

**IMPORTANT**: After completing any task that adds features, fixes bugs, or makes changes:
1. Update CHANGELOG.md with the changes made
2. Run `npm version patch` to bump the version and update manifest.json
3. Commit the version bump
4. This maintains proper version history and prepares for releases

### Build Configuration

- Uses esbuild for bundling (`esbuild.config.mjs`)
- Entry point: `src/main.ts` → output: `main.js`
- External dependencies include Obsidian API and CodeMirror modules
- Development builds include inline source maps, production builds are minified

## Plugin Manifest

- Plugin ID: `sourcemode-styling`
- Minimum Obsidian version: 0.15.0
- Desktop and mobile compatible