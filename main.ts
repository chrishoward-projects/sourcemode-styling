import { App, Editor, MarkdownView, MarkdownSubView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface SourceModeStylingSettings {
	rawModeEnabled: boolean;
	fontFamily: string;
	fontSize: number;
	lineHeight: number;
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

// Add font detection function
function detectAvailableFonts(fontList: string[]): string[] {
	const baseFonts = ['monospace', 'sans-serif', 'serif'];
	const testString = "mmmmmmmmmmlli";
	const testSize = "72px";
	
	// Create test element
	const testElement = document.createElement('span');
	testElement.style.fontSize = testSize;
	testElement.style.position = 'absolute';
	testElement.style.left = '-99999px';
	testElement.textContent = testString;
	document.body.appendChild(testElement);
	
	// Get baseline measurements
	const baselines: {[key: string]: {width: number, height: number}} = {};
	baseFonts.forEach(baseFont => {
		testElement.style.fontFamily = baseFont;
		baselines[baseFont] = {
			width: testElement.offsetWidth,
			height: testElement.offsetHeight
		};
	});
	
	// Test each font
	const availableFonts: string[] = [];
	fontList.forEach(font => {
		let isAvailable = false;
		baseFonts.forEach(baseFont => {
			testElement.style.fontFamily = `"${font}", ${baseFont}`;
			const dimensions = {
				width: testElement.offsetWidth,
				height: testElement.offsetHeight
			};
			
			// If dimensions changed, the font is available
			if (dimensions.width !== baselines[baseFont].width || 
				dimensions.height !== baselines[baseFont].height) {
				isAvailable = true;
			}
		});
		
		if (isAvailable || font === 'monospace') {
			availableFonts.push(font);
		}
	});
	
	// Clean up
	document.body.removeChild(testElement);
	
	return availableFonts;
}

const DEFAULT_SETTINGS: SourceModeStylingSettings = {
	rawModeEnabled: true,
	fontFamily: "Source Code Pro",
	fontSize: 14,
	lineHeight: 1.75
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
			const { fontFamily, fontSize, lineHeight } = this.settings;
			styleEl.textContent = `
				body.obsidian-mode-raw .view-content .markdown-source-view:not(.is-live-preview){
					--sourcemode-font-family: '${fontFamily}', monospace;
					--sourcemode-font-size: ${fontSize}px;
					--sourcemode-line-height: ${lineHeight};
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

		// Detect available fonts
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
	}
}
