import { MarkdownView,  Plugin, EventRef } from 'obsidian';
import { SourceModeStylingSettingTab } from './settingsTab';
import { CSSGenerator } from './CSSGenerator';
import { StyleInjector } from './StyleInjector';


export interface SourceModeStylingSettings {
	rawModeEnabled: boolean;
	fontFamily: string | 'theme';
	fontSize: number | 'theme';
	lineHeight: number | 'theme';
	fontColor: string | 'theme';
	headingColor: string | 'theme';
	backgroundColor: string | 'theme';
	fontWeight: string | number | 'theme';
}

const DEFAULT_SETTINGS: SourceModeStylingSettings = {
	rawModeEnabled: true,
	fontFamily: "Source Code Pro",
	fontSize: 14,
	lineHeight: 1.75,
	fontColor: "theme",
	headingColor: "#2d5b8c",
	backgroundColor: "theme",
	fontWeight: "theme"
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

		// console.log("Raw mode enabled", this.settings.rawModeEnabled);

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
			const css = CSSGenerator.generateCSS(this.settings);
			StyleInjector.injectCSS(css);
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
		StyleInjector.removeCSS();
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
