import { Setting } from 'obsidian';
import type SourceModeStyling from '../main';

export function addBackgroundColorSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	const bgSetting = new Setting(containerEl)
		.setName('Background color')
		.setDesc('Set the background color for source mode');

	const bgModeSelect = document.createElement('select');
	bgModeSelect.innerHTML = `<option value="theme">Theme default</option><option value="custom">Custom</option>`;
	const isCustom = plugin.settings.backgroundColor && plugin.settings.backgroundColor !== 'theme';
	bgModeSelect.value = isCustom ? 'custom' : 'theme';
	bgSetting.controlEl.appendChild(bgModeSelect);

	const colorInput = document.createElement('input');
	colorInput.type = 'color';
	colorInput.value = isCustom ? plugin.settings.backgroundColor : '#fbfaf6';
	if (!isCustom) colorInput.style.display = 'none';
	bgSetting.controlEl.appendChild(colorInput);

	bgModeSelect.addEventListener('change', async () => {
		if (bgModeSelect.value === 'custom') {
			colorInput.style.display = '';
			plugin.settings.backgroundColor = colorInput.value;
		} else {
			colorInput.style.display = 'none';
			plugin.settings.backgroundColor = 'theme';
		}
		await plugin.saveSettings();
		plugin.app.workspace.trigger('layout-change');
	});

	colorInput.addEventListener('input', async () => {
		if (bgModeSelect.value === 'custom') {
			plugin.settings.backgroundColor = colorInput.value;
			await plugin.saveSettings();
			plugin.app.workspace.trigger('layout-change');
		}
	});
} 