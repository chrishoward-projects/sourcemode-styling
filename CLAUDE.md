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
  - Manages styling via CSS custom properties (CSS variables) set on document.documentElement
  - Adds/removes `.source-mode-raw` class to document body based on active view state
  - Listens to workspace events (`active-leaf-change`, `layout-change`) to update styling

- **Settings system** (`src/settingsTab.ts` + `src/settings/`): Modular settings architecture
  - Each setting type has its own file (FontFamilySetting.ts, FontSizeSetting.ts, etc.)
  - Settings tab imports and adds each setting component individually
  - Font detection utility (`src/fontDetect.ts`) detects available monospace fonts

### Key Plugin Mechanics

- **CSS Targeting**: Styles target `.source-mode-raw .markdown-source-view.mod-cm6` selectors
- **Dynamic Styling**: Uses CSS custom properties (variables) defined in styles.css, updated via `setProperty()` based on settings
- **CSS Variables**: All dynamic values (font-family, font-size, colors, etc.) use CSS variables (e.g., `--sourcemode-font-family`)
- **State Management**: Plugin tracks styling state with `styleListenersRegistered` flag
- **View State Detection**: Checks if current view is MarkdownView in source mode to apply styling
- **Font Detection**: Uses CSS variables to test font availability without creating dynamic style elements

### Development Notes

- Plugin targets ES2018 and uses CommonJS format for Obsidian compatibility
- External Obsidian APIs are marked as external in the build process
- Uses TypeScript with strict null checks and inline source maps for development
- Refer always to Obsidian Developer Dcoumentation @https://github.com/obsidianmd/obsidian-developer-docs

### Troubleshooting

**Font Overrides Not Applying (appearance.json conflict)**

In rare cases, font settings in `.obsidian/appearance.json` may prevent plugin CSS variables from being applied, even though the plugin correctly:
- Detects source mode
- Adds the `source-mode-raw` class
- Sets CSS variables on `document.documentElement`

**Symptoms:**
- Debug mode shows all CSS variables being set correctly
- Computed styles on editor show Obsidian's default font instead of plugin font
- Issue occurs on specific vaults but not others

**Root Cause:**
Font settings in `appearance.json` (particularly `textFontFamily`, `monospaceFontFamily`) may have higher CSS specificity or be applied later in the cascade, overriding the plugin's CSS variables in certain Obsidian versions or configurations.

**Resolution:**
1. Manually edit `.obsidian/appearance.json` to remove font-related settings
2. Restart Obsidian
3. Reconfigure fonts through Settings > Appearance if needed
4. Plugin should now properly override fonts in source mode

**Prevention:**
The debug mode feature helps identify this issue by showing actual computed styles versus expected styles. Enable "Debug mode" in plugin settings and check browser console for discrepancies between set variables and computed values.

**Activating Debug Mode:**
Debug logging code exists in StylingManager.ts and StyleInjector.ts but the UI toggle is hidden by default. To enable:
1. Uncomment the debug mode toggle in `src/settingsTab.ts` (lines 34-45)
2. Rebuild the plugin with `npm run build`
3. Toggle will appear in plugin settings
4. Enable to see detailed console logs of styling operations

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