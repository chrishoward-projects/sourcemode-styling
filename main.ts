import { App, Editor, MarkdownView, MarkdownSubView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface SourceModeStylingSettings {
	rawModeEnabled: boolean;
}

const DEFAULT_SETTINGS: SourceModeStylingSettings = {
	rawModeEnabled: true
}

export default class SourceModeStyling extends Plugin {
	settings: SourceModeStylingSettings;

	async onload() {
		await this.loadSettings();


		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SourceModeStylingSettingTab(this.app, this));


		// === Add mode class logic ===
		const updateBodyModeClass = () => {
			const body = document.body;
			const modeClasses = [
				"obsidian-mode-source",
				"obsidian-mode-live",
				"obsidian-mode-preview"
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

		new Setting(containerEl)
			.setName('Enable raw source mode styling')
			.addToggle(text => text
				.setValue(this.plugin.settings.rawModeEnabled)
				.onChange(async (value) => {
					this.plugin.settings.rawModeEnabled = value;
					await this.plugin.saveSettings();
				}));
	}
}
