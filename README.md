# Source Mode Styling for Obsidian

Source Mode Styling is an Obsidian plugin that lets you customize the appearance of the source/raw mode editor. You can choose your preferred monospace font, font size, and line height for editing markdown in source mode, making your editing experience more comfortable and visually appealing.

## Features

- **Custom Font Family:** Select from available monospace fonts for source mode.
- **Adjust Font Size:** Set the font size (in px) for source mode.
- **Set Line Height:** Choose your preferred line height for better readability.
- **Enable/Disable Styling:** Toggle source mode styling on or off from the settings tab.
- **Applies Only to Source Mode:** Styles are applied only when editing in source/raw mode (not live preview).

## Installation

### Automatic (Recommended for Developers)

1. Clone this repository into your Obsidian vault's plugins folder:
   ```sh
   git clone <this-repo-url> .obsidian/plugins/sourcemode-styling
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Build the plugin in watch mode:
   ```sh
   npm run dev
   ```
4. Reload Obsidian and enable the plugin in Settings → Community plugins.

### Manual

1. Download or build the following files:
   - `main.js`
   - `manifest.json`
   - `styles.css`
2. Copy these files into a folder named `sourcemode-styling` inside your vault's `.obsidian/plugins/` directory.
3. Reload Obsidian and enable the plugin.

## Usage & Configuration

1. Open Obsidian and go to **Settings → Community plugins → Source Mode Styling**.
2. Configure the following options:
   - **Enable source mode styling:** Toggle the feature on or off.
   - **Monospace font:** Choose from detected available fonts.
   - **Font size:** Set the font size (9–20 px).
   - **Line height:** Set the line height (1.0–2.5).
3. Changes apply immediately when you switch to source mode in any markdown file.

## Development

- Requires Node.js v16 or higher.
- Main source code is in `src/`.
- Build scripts:
  - `npm run dev` — Build in watch mode for development.
  - `npm run build` — Production build.
- Versioning is managed via `version-bump.mjs` and updates `manifest.json` and `versions.json`.

## License

MIT License © Chris Howard

## Funding

If you find this plugin useful, you can add your funding URL in `manifest.json` to support further development.

## API Documentation

For more information about the Obsidian API, see: https://github.com/obsidianmd/obsidian-api
