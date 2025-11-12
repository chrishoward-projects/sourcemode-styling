import { PluginSettingTab, App } from "obsidian";
import type SourceModeStyling from "./main";
import { addFontFamilySetting } from "./settings/FontFamilySetting";
import { addFontSizeSetting } from "./settings/FontSizeSetting";
import { addLineHeightSetting } from "./settings/LineHeightSetting";
import { addFontColorSetting } from "./settings/FontColorSetting";
import { addHeadingColorSetting } from "./settings/HeadingColorSetting";
import { addBackgroundColorSetting } from "./settings/BackgroundColorSetting";
import { addFontWeightSetting } from "./settings/FontWeightSetting";

export class SourceModeStylingSettingTab extends PluginSettingTab {
	plugin: SourceModeStyling;

	constructor(app: App, plugin: SourceModeStyling) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		addFontFamilySetting(containerEl, this.plugin);
		addFontWeightSetting(containerEl, this.plugin);
		addFontSizeSetting(containerEl, this.plugin);
		addFontColorSetting(containerEl, this.plugin);
		addLineHeightSetting(containerEl, this.plugin);
		addHeadingColorSetting(containerEl, this.plugin);
		addBackgroundColorSetting(containerEl, this.plugin);
	}
}
