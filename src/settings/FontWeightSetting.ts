import { Setting } from 'obsidian';
import type SourceModeStyling from '../main';

export function addFontWeightSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	const fontWeightSetting = new Setting(containerEl)
		.setName('Font weight')
		.setDesc('Set the font weight for source/raw mode');
	const fontWeightModeSelect = document.createElement('select');
	fontWeightModeSelect.innerHTML = `<option value="theme">Theme default</option><option value="normal">Normal</option><option value="light">Light</option><option value="semibold">Semi-bold</option><option value="custom">Custom</option>`;
	const isFontWeightCustom = typeof plugin.settings.fontWeight === 'number';
	fontWeightModeSelect.value = isFontWeightCustom
		? 'custom'
		: (plugin.settings.fontWeight === 'light'
			? 'light'
			: (plugin.settings.fontWeight === 'semibold'
				? 'semibold'
				: (plugin.settings.fontWeight === 'normal' ? 'normal' : 'theme')));
	fontWeightSetting.controlEl.appendChild(fontWeightModeSelect);
	const fontWeightInput = document.createElement('input');
	fontWeightInput.type = 'number';
	fontWeightInput.min = '100';
	fontWeightInput.max = '900';
	fontWeightInput.step = '100';
	fontWeightInput.value = isFontWeightCustom ? plugin.settings.fontWeight?.toString() ?? '400' : '400';
	if (!isFontWeightCustom) fontWeightInput.style.display = 'none';
	fontWeightSetting.controlEl.appendChild(fontWeightInput);
	fontWeightModeSelect.addEventListener('change', async () => {
		if (fontWeightModeSelect.value === 'custom') {
			fontWeightInput.style.display = '';
			const num = parseInt(fontWeightInput.value);
			if (!isNaN(num)) plugin.settings.fontWeight = num;
		} else {
			fontWeightInput.style.display = 'none';
			if (
				fontWeightModeSelect.value === 'normal' ||
				fontWeightModeSelect.value === 'light' ||
				fontWeightModeSelect.value === 'semibold' ||
				fontWeightModeSelect.value === 'theme'
			) {
				plugin.settings.fontWeight = fontWeightModeSelect.value;
			}
		}
		await plugin.saveSettings();
		plugin.app.workspace.trigger('layout-change');
	});
	fontWeightInput.addEventListener('input', async () => {
		if (fontWeightModeSelect.value === 'custom') {
			const num = parseInt(fontWeightInput.value);
			if (!isNaN(num)) plugin.settings.fontWeight = num;
			await plugin.saveSettings();
			plugin.app.workspace.trigger('layout-change');
		}
	});
} 