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
	headingColor: "#2d5b8c"
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
				const { fontFamily, fontSize, lineHeight, headingColor } = this.settings;
				styleEl.textContent = `
					body.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview){
						--sourcemode-font-family: '${fontFamily}', monospace;
						--sourcemode-font-size: ${fontSize}px;
						--sourcemode-line-height: ${lineHeight};
						--sourcemode-heading-color: ${headingColor};
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
