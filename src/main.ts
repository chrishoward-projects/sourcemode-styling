import { Notice, Plugin, requireApiVersion } from 'obsidian';
import { SourceModeStylingSettingTab } from './settingsTab';
import { StylingManager } from './StylingManager';
import { NEXT_RELEASE_MIN_APP_VERSION } from './constants';


export interface SourceModeStylingSettings {
	rawModeEnabled: boolean;
	fontFamily: string;
	fontSize: number | 'theme';
	lineHeight: number | 'theme';
	fontColor: string;
	headingColor: string;
	backgroundColor: string;
	fontWeight: string | number;
	cachedAvailableFonts?: {
		fonts: string[];
		fontListHash: string;  // Detects MONOSPACE_FONTS changes
		timestamp: number;     // Future use for expiration
	};
	debugMode: boolean;
	upgradeNoticeShown: boolean;
}

const DEFAULT_SETTINGS: SourceModeStylingSettings = {
	rawModeEnabled: true,
	fontFamily: "Source Code Pro",
	fontSize: 14,
	lineHeight: 1.75,
	fontColor: "theme",
	headingColor: "#2d5b8c",
	backgroundColor: "theme",
	fontWeight: "theme",
	debugMode: false,
	upgradeNoticeShown: false
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

		void this.maybeShowUpgradeNotice();
	}

	/**
	 * Tells users on an Obsidian older than the next release's minimum, once,
	 * that this is the last version they will be offered. `requiredVersion` is a
	 * parameter rather than a constant read inline so the real gating logic can
	 * be exercised from the developer console without faking the app version.
	 */
	async maybeShowUpgradeNotice(requiredVersion: string = NEXT_RELEASE_MIN_APP_VERSION): Promise<void> {
		if (requireApiVersion(requiredVersion)) return;
		if (this.settings.upgradeNoticeShown) return;

		this.showUpgradeNotice(requiredVersion);

		this.settings.upgradeNoticeShown = true;
		await this.saveSettings();
	}

	showUpgradeNotice(requiredVersion: string = NEXT_RELEASE_MIN_APP_VERSION): void {
		const message = createFragment(frag => {
			frag.createDiv({ text: 'Source mode styling' });
			frag.createEl('br');
			frag.createDiv({
				text: `Version ${this.manifest.version} is the last update available for your version of Obsidian.`
			});
			frag.createEl('br');
			frag.createDiv({
				text: `Later releases need Obsidian ${requiredVersion} or newer. Update Obsidian to keep receiving plugin updates.`
			});
			frag.createEl('br');
			frag.createDiv({ text: 'Click to close this notice' });
		});

		// Duration 0 keeps the notice up until dismissed; it is shown only once.
		new Notice(message, 0);
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
