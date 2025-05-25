import { Setting } from 'obsidian';
import type SourceModeStyling from '../main';

export function addHeadingColorSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	const headingColorSetting = new Setting(containerEl)
		.setName('Heading color')
		.setDesc('Set the color for headings in source mode');
	const headingColorModeSelect = document.createElement('select');
	headingColorModeSelect.innerHTML = `<option value="theme">Theme default</option><option value="custom">Custom</option>`;
	const isHeadingColorCustom = plugin.settings.headingColor && plugin.settings.headingColor !== 'theme';
	headingColorModeSelect.value = isHeadingColorCustom ? 'custom' : 'theme';
	headingColorSetting.controlEl.appendChild(headingColorModeSelect);
	const headingColorInput = document.createElement('input');
	headingColorInput.type = 'color';
	headingColorInput.value = isHeadingColorCustom ? plugin.settings.headingColor : '#2d5b8c';
	if (!isHeadingColorCustom) headingColorInput.style.display = 'none';
	headingColorSetting.controlEl.appendChild(headingColorInput);
	headingColorModeSelect.addEventListener('change', async () => {
		if (headingColorModeSelect.value === 'custom') {
			headingColorInput.style.display = '';
			plugin.settings.headingColor = headingColorInput.value;
		} else {
			headingColorInput.style.display = 'none';
			plugin.settings.headingColor = 'theme';
		}
		await plugin.saveSettings();
		plugin.app.workspace.trigger('layout-change');
	});
	headingColorInput.addEventListener('input', async () => {
		if (headingColorModeSelect.value === 'custom') {
			plugin.settings.headingColor = headingColorInput.value;
			await plugin.saveSettings();
			plugin.app.workspace.trigger('layout-change');
		}
	});
} 