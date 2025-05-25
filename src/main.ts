import { App, Editor, MarkdownView, MarkdownSubView, Modal, Notice, Plugin, PluginSettingTab, Setting, EventRef } from 'obsidian';
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

	private styleListenersRegistered = false;
	private _updateBodyModeClass?: () => void;
	private _updateInjectedStyle?: () => void;
	private _activeLeafChangeHandler?: EventRef;
	private _layoutChangeHandler?: EventRef;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SourceModeStylingSettingTab(this.app, this));

		console.log("Raw mode enabled", this.settings.rawModeEnabled);

		this.updateStylingEnabled();
	}

	updateStylingEnabled() {
		if (this.settings.rawModeEnabled) {
			this.enableStyling();
		} else {
			this.disableStyling();
		}
	}

	enableStyling() {
		if (this.styleListenersRegistered) return;
		const updateInjectedStyle = () => {
			let styleEl = document.getElementById("sourcemode-styling-font-style") as HTMLStyleElement | null;
			if (!styleEl) {
				styleEl = document.createElement("style");
				styleEl.id = "sourcemode-styling-font-style";
				document.head.appendChild(styleEl);
			}
			const { fontFamily, fontSize, lineHeight, headingColor, backgroundColor } = this.settings;
			let backgroundColorVar = backgroundColor && backgroundColor !== 'theme' ? `background-color: ${backgroundColor};` : '';
			let headingColorVar = headingColor && headingColor !== 'theme' ? `color: ${headingColor};` : '';
			let fontFamilyVar = fontFamily && fontFamily !== 'theme' ? `font-family: '${fontFamily}', monospace;` : '';
			let fontSizeVar = typeof fontSize === 'number' ? `font-size: ${fontSize}px;` : '';
			let lineHeightVar = typeof lineHeight === 'number' ? `line-height: ${lineHeight};` : '';
			styleEl.textContent = `
				.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview){
					${fontFamilyVar}
					${fontSizeVar}
					${backgroundColorVar}
				}
				.obsidian-mode-raw .markdown-source-view.mod-cm6:not(.is-live-preview) .cm-scroller{
					${lineHeightVar}
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
					${fontFamilyVar}
					font-variant:initial;
					${lineHeightVar}
					${headingColorVar}
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

		this._updateBodyModeClass = updateBodyModeClass;
		this._updateInjectedStyle = updateInjectedStyle;

		this._activeLeafChangeHandler = this.app.workspace.on("active-leaf-change", updateBodyModeClass);
		this._layoutChangeHandler = this.app.workspace.on("layout-change", updateBodyModeClass);
		this.styleListenersRegistered = true;
		updateBodyModeClass();
	}

	disableStyling() {
		if (!this.styleListenersRegistered) return;
		const body = document.body;
		body.classList.remove("obsidian-mode-raw");
		const styleEl = document.getElementById("sourcemode-styling-font-style");
		if (styleEl) styleEl.remove();
		if (this._activeLeafChangeHandler && this._updateBodyModeClass) this.app.workspace.off("active-leaf-change", this._updateBodyModeClass);
		if (this._layoutChangeHandler && this._updateBodyModeClass) this.app.workspace.off("layout-change", this._updateBodyModeClass);
		this.styleListenersRegistered = false;
	}

	// For settings tab to call when toggling
	async toggleStyling(enabled: boolean) {
		this.settings.rawModeEnabled = enabled;
		await this.saveSettings();
		this.updateStylingEnabled();
	}

	// For cleanup
	onunload() {
		this.disableStyling();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
