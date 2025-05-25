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
					await this.plugin.toggleStyling(value);
				}));

		// Detect available fonts
		const MONOSPACE_FONTS = [
			"Andale Mono",
			"Anonymous Pro",
			"Bitstream Vera Sans Mono",
			"Code New Roman",
			"Cascadia Code",
			"Cascadia Mono",
			"Cascadia Mono PL",
			"Courier New",
			"Courier Prime",
			"Courier Prime Code",
			"Courier Prime Mono",
			"Courier Prime Sans",
			"Courier Prime Sans Mono",
			"Courier Prime Serif",
			"Courier Prime Serif Mono",
			"Consolas",
			"DejaVu Sans Mono",
			"Droid Sans Mono",
			"Envy Code R",
			"Fira Mono",
			"Fira Code",
			"Hack",
			"IBM Plex Mono",
			"Inconsolata",
			"JetBrains Mono",
			"Liberation Mono",
			"Menlo",
			"Meslo LG S",
			"Meslo LG M",
			"Meslo LG L",
			"Monaco",
			"Noto Mono",
			"Operator Mono",
			"Pragmata Pro",
			"Red Hat Mono",
			"Roboto Mono",
			"Source Code Pro",
			"Space Mono",
			"Ubuntu Mono",
			"Ubuntu Sans Mono",
			"VT323",
			"monospace"
		];
		const availableFonts = detectAvailableFonts(MONOSPACE_FONTS);

		// Monospace font setting with theme default option
		const fontSetting = new Setting(containerEl)
			.setName('Monospace font')
			.setDesc('Select a monospace font for source mode');
		const fontModeSelect = document.createElement('select');
		fontModeSelect.innerHTML = `<option value="theme">Use theme font</option>` + availableFonts.map(font => `<option value="${font}">${font}</option>`).join('');
		fontModeSelect.value = this.plugin.settings.fontFamily && this.plugin.settings.fontFamily !== 'theme' ? this.plugin.settings.fontFamily : 'theme';
		fontSetting.controlEl.appendChild(fontModeSelect);
		fontModeSelect.addEventListener('change', async () => {
			this.plugin.settings.fontFamily = fontModeSelect.value;
			await this.plugin.saveSettings();
			this.plugin.app.workspace.trigger('layout-change');
		});

		// Font size setting with theme default option
		const fontSizeSetting = new Setting(containerEl)
			.setName('Font size')
			.setDesc('Set the font size for source mode (px)');
		const fontSizeModeSelect = document.createElement('select');
		fontSizeModeSelect.innerHTML = `<option value="theme">Theme default</option><option value="custom">Custom</option>`;
		const isFontSizeCustom = typeof this.plugin.settings.fontSize === 'number';
		fontSizeModeSelect.value = isFontSizeCustom ? 'custom' : 'theme';
		fontSizeSetting.controlEl.appendChild(fontSizeModeSelect);
		const fontSizeInput = document.createElement('input');
		fontSizeInput.type = 'number';
		fontSizeInput.min = '9';
		fontSizeInput.max = '20';
		fontSizeInput.value = isFontSizeCustom ? this.plugin.settings.fontSize.toString() : '14';
		if (!isFontSizeCustom) fontSizeInput.style.display = 'none';
		fontSizeSetting.controlEl.appendChild(fontSizeInput);
		fontSizeModeSelect.addEventListener('change', async () => {
			if (fontSizeModeSelect.value === 'custom') {
				fontSizeInput.style.display = '';
				const num = parseInt(fontSizeInput.value);
				if (!isNaN(num)) this.plugin.settings.fontSize = num;
			} else {
				fontSizeInput.style.display = 'none';
				(this.plugin.settings as any).fontSize = 'theme';
			}
			await this.plugin.saveSettings();
			this.plugin.app.workspace.trigger('layout-change');
		});
		fontSizeInput.addEventListener('input', async () => {
			if (fontSizeModeSelect.value === 'custom') {
				const num = parseInt(fontSizeInput.value);
				if (!isNaN(num)) this.plugin.settings.fontSize = num;
				await this.plugin.saveSettings();
				this.plugin.app.workspace.trigger('layout-change');
			}
		});

		// Line height setting with theme default option
		const lineHeightSetting = new Setting(containerEl)
			.setName('Line height')
			.setDesc('Set the line height for source mode (e.g. 1.0–2.5)');
		const lineHeightModeSelect = document.createElement('select');
		lineHeightModeSelect.innerHTML = `<option value="theme">Theme default</option><option value="custom">Custom</option>`;
		const isLineHeightCustom = typeof this.plugin.settings.lineHeight === 'number';
		lineHeightModeSelect.value = isLineHeightCustom ? 'custom' : 'theme';
		lineHeightSetting.controlEl.appendChild(lineHeightModeSelect);
		const lineHeightInput = document.createElement('input');
		lineHeightInput.type = 'number';
		lineHeightInput.min = '1.0';
		lineHeightInput.max = '2.5';
		lineHeightInput.step = '0.05';
		lineHeightInput.value = isLineHeightCustom ? this.plugin.settings.lineHeight.toString() : '1.75';
		if (!isLineHeightCustom) lineHeightInput.style.display = 'none';
		lineHeightSetting.controlEl.appendChild(lineHeightInput);
		lineHeightModeSelect.addEventListener('change', async () => {
			if (lineHeightModeSelect.value === 'custom') {
				lineHeightInput.style.display = '';
				const num = parseFloat(lineHeightInput.value);
				if (!isNaN(num)) this.plugin.settings.lineHeight = num;
			} else {
				lineHeightInput.style.display = 'none';
				(this.plugin.settings as any).lineHeight = 'theme';
			}
			await this.plugin.saveSettings();
			this.plugin.app.workspace.trigger('layout-change');
		});
		lineHeightInput.addEventListener('input', async () => {
			if (lineHeightModeSelect.value === 'custom') {
				const num = parseFloat(lineHeightInput.value);
				if (!isNaN(num)) this.plugin.settings.lineHeight = num;
				await this.plugin.saveSettings();
				this.plugin.app.workspace.trigger('layout-change');
			}
		});

		// Heading color setting with theme default option
		const headingColorSetting = new Setting(containerEl)
			.setName('Heading color')
			.setDesc('Set the color for headings in source mode');
		const headingColorModeSelect = document.createElement('select');
		headingColorModeSelect.innerHTML = `<option value="theme">Theme default</option><option value="custom">Custom</option>`;
		const isHeadingColorCustom = this.plugin.settings.headingColor && this.plugin.settings.headingColor !== 'theme';
		headingColorModeSelect.value = isHeadingColorCustom ? 'custom' : 'theme';
		headingColorSetting.controlEl.appendChild(headingColorModeSelect);
		const headingColorInput = document.createElement('input');
		headingColorInput.type = 'color';
		headingColorInput.value = isHeadingColorCustom ? this.plugin.settings.headingColor : '#2d5b8c';
		if (!isHeadingColorCustom) headingColorInput.style.display = 'none';
		headingColorSetting.controlEl.appendChild(headingColorInput);
		headingColorModeSelect.addEventListener('change', async () => {
			if (headingColorModeSelect.value === 'custom') {
				headingColorInput.style.display = '';
				this.plugin.settings.headingColor = headingColorInput.value;
			} else {
				headingColorInput.style.display = 'none';
				this.plugin.settings.headingColor = 'theme';
			}
			await this.plugin.saveSettings();
			this.plugin.app.workspace.trigger('layout-change');
		});
		headingColorInput.addEventListener('input', async () => {
			if (headingColorModeSelect.value === 'custom') {
				this.plugin.settings.headingColor = headingColorInput.value;
				await this.plugin.saveSettings();
				this.plugin.app.workspace.trigger('layout-change');
			}
		});

		// Background color setting with theme default option
		const bgSetting = new Setting(containerEl)
			.setName('Background color')
			.setDesc('Set the background color for source mode');

		const bgModeSelect = document.createElement('select');
		bgModeSelect.innerHTML = `<option value="theme">Theme default</option><option value="custom">Custom</option>`;
		const isCustom = this.plugin.settings.backgroundColor && this.plugin.settings.backgroundColor !== 'theme';
		bgModeSelect.value = isCustom ? 'custom' : 'theme';
		bgSetting.controlEl.appendChild(bgModeSelect);

		const colorInput = document.createElement('input');
		colorInput.type = 'color';
		colorInput.value = isCustom ? this.plugin.settings.backgroundColor : '#fbfaf6';
		if (!isCustom) colorInput.style.display = 'none';
		bgSetting.controlEl.appendChild(colorInput);

		bgModeSelect.addEventListener('change', async (e) => {
			if (bgModeSelect.value === 'custom') {
				colorInput.style.display = '';
				this.plugin.settings.backgroundColor = colorInput.value;
			} else {
				colorInput.style.display = 'none';
				this.plugin.settings.backgroundColor = 'theme';
			}
			await this.plugin.saveSettings();
			this.plugin.app.workspace.trigger('layout-change');
		});

		colorInput.addEventListener('input', async (e) => {
			if (bgModeSelect.value === 'custom') {
				this.plugin.settings.backgroundColor = colorInput.value;
				await this.plugin.saveSettings();
				this.plugin.app.workspace.trigger('layout-change');
			}
		});

		// Font weight setting with theme default option
		const fontWeightSetting = new Setting(containerEl)
			.setName('Font weight')
			.setDesc('Set the font weight for source/raw mode');
		const fontWeightModeSelect = document.createElement('select');
		fontWeightModeSelect.innerHTML = `<option value="theme">Theme default</option><option value="normal">Normal</option><option value="light">Light</option><option value="semibold">Semi-bold</option><option value="custom">Custom</option>`;
		const isFontWeightCustom = typeof this.plugin.settings.fontWeight === 'number';
		fontWeightModeSelect.value = isFontWeightCustom
			? 'custom'
			: (this.plugin.settings.fontWeight === 'light'
				? 'light'
				: (this.plugin.settings.fontWeight === 'semibold'
					? 'semibold'
					: (this.plugin.settings.fontWeight === 'normal' ? 'normal' : 'theme')));
		fontWeightSetting.controlEl.appendChild(fontWeightModeSelect);
		const fontWeightInput = document.createElement('input');
		fontWeightInput.type = 'number';
		fontWeightInput.min = '100';
		fontWeightInput.max = '900';
		fontWeightInput.step = '100';
		fontWeightInput.value = isFontWeightCustom ? this.plugin.settings.fontWeight?.toString() ?? '400' : '400';
		if (!isFontWeightCustom) fontWeightInput.style.display = 'none';
		fontWeightSetting.controlEl.appendChild(fontWeightInput);
		fontWeightModeSelect.addEventListener('change', async () => {
			if (fontWeightModeSelect.value === 'custom') {
				fontWeightInput.style.display = '';
				const num = parseInt(fontWeightInput.value);
				if (!isNaN(num)) this.plugin.settings.fontWeight = num;
			} else {
				fontWeightInput.style.display = 'none';
				if (
					fontWeightModeSelect.value === 'normal' ||
					fontWeightModeSelect.value === 'light' ||
					fontWeightModeSelect.value === 'semibold' ||
					fontWeightModeSelect.value === 'theme'
				) {
					this.plugin.settings.fontWeight = fontWeightModeSelect.value;
				}
			}
			await this.plugin.saveSettings();
			this.plugin.app.workspace.trigger('layout-change');
		});
		fontWeightInput.addEventListener('input', async () => {
			if (fontWeightModeSelect.value === 'custom') {
				const num = parseInt(fontWeightInput.value);
				if (!isNaN(num)) this.plugin.settings.fontWeight = num;
				await this.plugin.saveSettings();
				this.plugin.app.workspace.trigger('layout-change');
			}
		});
	}
} 