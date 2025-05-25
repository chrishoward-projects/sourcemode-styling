import { PluginSettingTab, Setting } from 'obsidian';
import { detectAvailableFonts } from './fontDetect';
import type SourceModeStyling from './main';

export class SourceModeStylingSettingTab extends PluginSettingTab {
	plugin: SourceModeStyling;

	constructor(app: any, plugin: SourceModeStyling) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		const header = containerEl.createEl("h2", {text: "Source mode styling"});
		header.addClass("sourcemode-styling-header");

		new Setting(containerEl)
			.setName('Enable source mode styling')
			.addToggle(text => text
				.setValue(this.plugin.settings.rawModeEnabled)
				.onChange(async (value) => {
					this.plugin.settings.rawModeEnabled = value;
					await this.plugin.saveSettings();
					this.plugin.app.workspace.trigger('layout-change');
				}));

		// Detect available fonts
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
		const availableFonts = detectAvailableFonts(MONOSPACE_FONTS);

		new Setting(containerEl)
			.setName('Monospace font')
			.setDesc(`Select the monospace font for source/raw mode (${availableFonts.length} available)`)
			.addDropdown(drop => {
				availableFonts.forEach(font => drop.addOption(font, font));
				// Make sure current setting is available, fallback to first available font
				const currentFont = availableFonts.includes(this.plugin.settings.fontFamily) 
					? this.plugin.settings.fontFamily 
					: availableFonts[0];
				drop.setValue(currentFont);
				drop.onChange(async (value) => {
					this.plugin.settings.fontFamily = value;
					await this.plugin.saveSettings();
					this.plugin.app.workspace.trigger('layout-change');
				});
			});

		new Setting(containerEl)
			.setName('Font size')
			.setDesc('Set the font size for source/raw mode (px)')
			.addText(text => {
				text.inputEl.type = 'number';
				text.inputEl.min = '9';
				text.inputEl.max = '20';
				text.setValue(this.plugin.settings.fontSize.toString());
				text.onChange(async (value) => {
					const num = parseInt(value);
					if (!isNaN(num) && num >= 9 && num <= 20) {
						this.plugin.settings.fontSize = num;
						await this.plugin.saveSettings();
						this.plugin.app.workspace.trigger('layout-change');
					}
				});
			});

		new Setting(containerEl)
			.setName('Line height')
			.setDesc('Set the line height for source/raw mode (e.g. 1.0–2.5)')
			.addText(text => {
				text.inputEl.type = 'number';
				text.inputEl.min = '1.0';
				text.inputEl.max = '2.5';
				text.inputEl.step = '0.05';
				text.setValue(this.plugin.settings.lineHeight.toString());
				text.onChange(async (value) => {
					const num = parseFloat(value);
					if (!isNaN(num) && num >= 1.0 && num <= 2.5) {
						this.plugin.settings.lineHeight = num;
						await this.plugin.saveSettings();
						this.plugin.app.workspace.trigger('layout-change');
					}
				});
			});

		new Setting(containerEl)
			.setName('Heading color')
			.setDesc('Set the color for headings in source/raw mode')
			.addText(text => {
				text.inputEl.type = 'color';
				text.setValue(this.plugin.settings.headingColor || '#222222');
				text.onChange(async (value) => {
					this.plugin.settings.headingColor = value;
					await this.plugin.saveSettings();
					this.plugin.app.workspace.trigger('layout-change');
				});
			});

		new Setting(containerEl)
			.setName('Background color')
			.setDesc('Set the background color for source/raw mode')
			.addText(text => {
				text.inputEl.type = 'color';
				text.setValue(this.plugin.settings.backgroundColor || '#fbfaf6');
				text.onChange(async (value) => {
					this.plugin.settings.backgroundColor = value;
					await this.plugin.saveSettings();
					this.plugin.app.workspace.trigger('layout-change');
				});
			});
	}
} 