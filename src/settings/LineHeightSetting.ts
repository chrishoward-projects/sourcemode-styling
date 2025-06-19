import { Setting } from 'obsidian';
import type SourceModeStyling from '../main';

export function addLineHeightSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	const lineHeightSetting = new Setting(containerEl)
		.setName('Line height')
		.setDesc('Set the line height for source mode (e.g. 1.0–2.5)');
	const lineHeightModeSelect = document.createElement('select');
	const themeOption = document.createElement('option');
	themeOption.value = 'theme';
	themeOption.textContent = 'Theme default';
	const customOption = document.createElement('option');
	customOption.value = 'custom';
	customOption.textContent = 'Custom';
	lineHeightModeSelect.appendChild(themeOption);
	lineHeightModeSelect.appendChild(customOption);
	const isLineHeightCustom = typeof plugin.settings.lineHeight === 'number';
	lineHeightModeSelect.value = isLineHeightCustom ? 'custom' : 'theme';
	lineHeightSetting.controlEl.appendChild(lineHeightModeSelect);
	const lineHeightInput = document.createElement('input');
	lineHeightInput.type = 'number';
	lineHeightInput.min = '1.0';
	lineHeightInput.max = '2.5';
	lineHeightInput.step = '0.05';
	lineHeightInput.value = isLineHeightCustom ? plugin.settings.lineHeight.toString() : '1.75';
	if (!isLineHeightCustom) lineHeightInput.style.display = 'none';
	lineHeightSetting.controlEl.appendChild(lineHeightInput);
	lineHeightModeSelect.addEventListener('change', async () => {
		if (lineHeightModeSelect.value === 'custom') {
			lineHeightInput.style.display = '';
			const num = parseFloat(lineHeightInput.value);
			if (!isNaN(num)) plugin.settings.lineHeight = num;
		} else {
			lineHeightInput.style.display = 'none';
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(plugin.settings as any).lineHeight = 'theme';
		}
		await plugin.saveSettings();
		plugin.app.workspace.trigger('layout-change');
	});
	lineHeightInput.addEventListener('input', async () => {
		if (lineHeightModeSelect.value === 'custom') {
			const num = parseFloat(lineHeightInput.value);
			if (!isNaN(num)) plugin.settings.lineHeight = num;
			await plugin.saveSettings();
			plugin.app.workspace.trigger('layout-change');
		}
	});
} 