import { Setting } from 'obsidian';
import type SourceModeStyling from '../main';

export function addFontSizeSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	const fontSizeSetting = new Setting(containerEl)
		.setName('Font size')
		.setDesc('Set the font size for source mode (px)');
	const fontSizeModeSelect = document.createElement('select');
	fontSizeModeSelect.innerHTML = `<option value="theme">Theme default</option><option value="custom">Custom</option>`;
	const isFontSizeCustom = typeof plugin.settings.fontSize === 'number';
	fontSizeModeSelect.value = isFontSizeCustom ? 'custom' : 'theme';
	fontSizeSetting.controlEl.appendChild(fontSizeModeSelect);
	const fontSizeInput = document.createElement('input');
	fontSizeInput.type = 'number';
	fontSizeInput.min = '9';
	fontSizeInput.max = '20';
	fontSizeInput.value = isFontSizeCustom ? plugin.settings.fontSize.toString() : '14';
	if (!isFontSizeCustom) fontSizeInput.style.display = 'none';
	fontSizeSetting.controlEl.appendChild(fontSizeInput);
	fontSizeModeSelect.addEventListener('change', async () => {
		if (fontSizeModeSelect.value === 'custom') {
			fontSizeInput.style.display = '';
			const num = parseInt(fontSizeInput.value);
			if (!isNaN(num)) plugin.settings.fontSize = num;
		} else {
			fontSizeInput.style.display = 'none';
			(plugin.settings as any).fontSize = 'theme';
		}
		await plugin.saveSettings();
		plugin.app.workspace.trigger('layout-change');
	});
	fontSizeInput.addEventListener('input', async () => {
		if (fontSizeModeSelect.value === 'custom') {
			const num = parseInt(fontSizeInput.value);
			if (!isNaN(num)) plugin.settings.fontSize = num;
			await plugin.saveSettings();
			plugin.app.workspace.trigger('layout-change');
		}
	});
} 