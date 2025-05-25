import { App, Editor, MarkdownView, MarkdownSubView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { detectAvailableFonts } from './fontDetect';
import { SourceModeStylingSettingTab } from './settingsTab';

// Remember to rename these classes and interfaces!

interface SourceModeStylingSettings {
	rawModeEnabled: boolean;
	fontFamily: string;
	fontSize: number;
	lineHeight: number;
	headingColor: string;
	backgroundColor: string;
}

const MONOSPACE_FONTS = [
	"Consolas",
	"Courier New",
	"Fira Mono",
	"JetBrains Mono",
	"Menlo",
	"Monaco",
	"Source Code Pro",
	"monospace"
];

const DEFAULT_SETTINGS: SourceModeStylingSettings = {
	rawModeEnabled: true,
	fontFamily: "Source Code Pro",
	fontSize: 14,
	lineHeight: 1.75,
	headingColor: "#2d5b8c",
	backgroundColor: "theme"
}

export default class SourceModeStyling extends Plugin {
	settings: SourceModeStylingSettings;

	async onload() {
		await this.loadSettings();


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SourceModeStylingSettingTab(this.app, this));

		console.log("Raw mode enabled", this.settings.rawModeEnabled);

		if (this.settings.rawModeEnabled === true) {

			// === Add mode class logic ===
			const updateInjectedStyle = () => {
				let styleEl = document.getElementById("sourcemode-styling-font-style") as HTMLStyleElement | null;
				if (!styleEl) {
					styleEl = document.createElement("style");
					styleEl.id = "sourcemode-styling-font-style";
					document.head.appendChild(styleEl);
				}
				const { fontFamily, fontSize, lineHeight, headingColor, backgroundColor } = this.settings;
				let bgVar = backgroundColor && backgroundColor !== 'theme' ? `--sourcemode-background-color: ${backgroundColor};` : '';
				styleEl.textContent = `
					body.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview){
						--sourcemode-font-family: '${fontFamily}', monospace;
						--sourcemode-font-size: ${fontSize}px;
						--sourcemode-line-height: ${lineHeight};
						--sourcemode-heading-color: ${headingColor};
						${bgVar}
					}
					.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview){
						font-family: var(--sourcemode-font-family);
						font-size: var(--sourcemode-font-size);
						background-color: var(--sourcemode-background-color, #fbfaf6);
					}
					.obsidian-mode-raw .markdown-source-view.mod-cm6:not(.is-live-preview) .cm-scroller{
						line-height: var(--sourcemode-line-height);
					}

					.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview) .cm-header-1,
					.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview) .cm-header-2,
					.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview) .cm-header-3,
					.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview) .cm-header-4,
					.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview) .cm-header-5,
					.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview) .cm-header-6 {
						font-size: initial!important;
						font-weight: bold;
						text-decoration: none;
						text-transform: unset;
						font-family: var(--sourcemode-font-family);
						font-variant:initial;
						line-height: var(--sourcemode-line-height);
						color: var(--sourcemode-heading-color, #222222);
					}

				`;
			};

			const updateBodyModeClass = () => {
				const body = document.body;
				const modeClasses = [
					"obsidian-mode-raw"
				];
				// Remove all mode classes first
				body.classList.remove(...modeClasses);

				const view = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (view && view.getState().source === true && view.getState().mode === "source") {
					body.classList.add(`obsidian-mode-raw`);
				}
				updateInjectedStyle();
			};

			// Listen for both active-leaf-change and layout-change
			this.registerEvent(this.app.workspace.on("active-leaf-change", updateBodyModeClass));
			this.registerEvent(this.app.workspace.on("layout-change", updateBodyModeClass));

			// Set initial mode class
			updateBodyModeClass();
		}
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
