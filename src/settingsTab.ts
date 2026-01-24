import { PluginSettingTab, App} from "obsidian";
// import { Setting } from "obsidian";  // uncomment this when enabling debugging setting
import type SourceModeStyling from "./main";
import { addFontFamilySetting } from "./settings/FontFamilySetting";
import { addFontSizeSetting } from "./settings/FontSizeSetting";
import { addLineHeightSetting } from "./settings/LineHeightSetting";
import { addFontColorSetting } from "./settings/FontColorSetting";
import { addHeadingColorSetting } from "./settings/HeadingColorSetting";
import { addBackgroundColorSetting } from "./settings/BackgroundColorSetting";
import { addFontWeightSetting } from "./settings/FontWeightSetting";
import { addStylePreview, StylePreview } from "./settings/StylePreview";

export class SourceModeStylingSettingTab extends PluginSettingTab {
	plugin: SourceModeStyling;
	private stylePreview: StylePreview | null = null;

	constructor(app: App, plugin: SourceModeStyling) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		// Clean up existing preview before recreating
		this.cleanupPreview();

		containerEl.empty();

		addFontFamilySetting(containerEl, this.plugin);
		addFontWeightSetting(containerEl, this.plugin);
		addFontSizeSetting(containerEl, this.plugin);
		addFontColorSetting(containerEl, this.plugin);
		addLineHeightSetting(containerEl, this.plugin);
		addHeadingColorSetting(containerEl, this.plugin);
		addBackgroundColorSetting(containerEl, this.plugin);

		this.stylePreview = addStylePreview(containerEl, this.plugin);

		// Debug mode toggle - Hidden but available for troubleshooting
		// Uncomment to enable debug mode UI for diagnosing styling issues
		// Make user VERBOSE is enabled in console for full debug output

		// new Setting(containerEl)
		// 	.setName('Debug mode')
		// 	.setDesc('Enable debug logging to console (helpful for troubleshooting styling issues)')
		// 	.addToggle(toggle => toggle
		// 		.setValue(this.plugin.settings.debugMode)
		// 		.onChange(async (value) => {
		// 			this.plugin.settings.debugMode = value;
		// 			await this.plugin.saveSettings();
		// 		})
		// 	);

	}

	/**
	 * Called by Obsidian when the settings tab is hidden or plugin is disabled.
	 * Ensures proper cleanup of event listeners to prevent memory leaks.
	 */
	hide(): void {
		this.cleanupPreview();
	}

	private cleanupPreview(): void {
		if (this.stylePreview) {
			this.stylePreview.destroy();
			this.stylePreview = null;
		}
	}
}
