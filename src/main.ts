import { Plugin } from 'obsidian';
import { SourceModeStylingSettingTab } from './settingsTab';
import { StylingManager } from './StylingManager';


export interface SourceModeStylingSettings {
	rawModeEnabled: boolean;
	fontFamily: string;
	fontSize: number | 'theme';
	lineHeight: number | 'theme';
	fontColor: string;
	headingColor: string;
	backgroundColor: string;
	fontWeight: string | number;
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
	private stylingManager: StylingManager;

	async onload() {
		await this.loadSettings();

		// Initialize styling manager
		this.stylingManager = new StylingManager(this.app, this, this.settings);

		// Add settings tab
		this.addSettingTab(new SourceModeStylingSettingTab(this.app, this));

		this.updateStylingEnabled();
	}

	updateStylingEnabled() {
		if (this.settings.rawModeEnabled) {
			this.stylingManager.enable();
		} else {
			this.stylingManager.disable();
		}
	}

	// For settings tab to call when toggling
	async toggleStyling(enabled: boolean) {
		this.settings.rawModeEnabled = enabled;
		await this.saveSettings();
		this.updateStylingEnabled();
	}

	onunload() {
		this.stylingManager.disable();
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Update styling manager with new settings
		this.stylingManager.updateSettings(this.settings);
	}
}
