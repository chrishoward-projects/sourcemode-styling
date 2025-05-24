import { App, Editor, MarkdownView, MarkdownSubView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface SourceModeStylingSettings {
	rawModeEnabled: boolean;
	fontFamily: string;
	fontSize: number;
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
	fontSize: 14
}

export default class SourceModeStyling extends Plugin {
	settings: SourceModeStylingSettings;

	async onload() {
		await this.loadSettings();


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SourceModeStylingSettingTab(this.app, this));


		// === Add mode class logic ===
		const updateInjectedStyle = () => {
			let styleEl = document.getElementById("sourcemode-styling-font-style") as HTMLStyleElement | null;
			if (!styleEl) {
				styleEl = document.createElement("style");
				styleEl.id = "sourcemode-styling-font-style";
				document.head.appendChild(styleEl);
			}
			const { fontFamily, fontSize } = this.settings;
			styleEl.textContent = `
				body.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview){
					--sourcemode-font-family: '${fontFamily}', monospace;
					--sourcemode-font-size: ${fontSize}px;
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
			if (view) {
				console.log("Raw mode enable",this.settings.rawModeEnabled);
				console.log(view.getState());
				if (view.getState().source === true && view.getState().mode === "source") {
						body.classList.add(`obsidian-mode-raw`);
				}
			}
			updateInjectedStyle();
		};

		// Listen for both active-leaf-change and layout-change
		this.registerEvent(this.app.workspace.on("active-leaf-change", updateBodyModeClass));
		this.registerEvent(this.app.workspace.on("layout-change", updateBodyModeClass));

		// Set initial mode class
		updateBodyModeClass();
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

class SourceModeStylingModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class SourceModeStylingSettingTab extends PluginSettingTab {
	plugin: SourceModeStyling;

	constructor(app: App, plugin: SourceModeStyling) {
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

		new Setting(containerEl)
			.setName('Monospace font')
			.setDesc('Select the monospace font for source/raw mode')
			.addDropdown(drop => {
				MONOSPACE_FONTS.forEach(font => drop.addOption(font, font));
				drop.setValue(this.plugin.settings.fontFamily);
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
	}
}
