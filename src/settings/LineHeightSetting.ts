import { Setting } from 'obsidian';
import type SourceModeStyling from '../main';

export function addLineHeightSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	const lineHeightSetting = new Setting(containerEl)
		.setName('Line height')
		.setDesc('Set the line height for source mode (e.g. 1.0-2.5)');

	const lineHeightModeSelect = lineHeightSetting.controlEl.createEl('select');
	lineHeightModeSelect.createEl('option', { value: 'theme', text: 'Theme default' });
	lineHeightModeSelect.createEl('option', { value: 'custom', text: 'Custom' });

	const isLineHeightCustom = typeof plugin.settings.lineHeight === 'number';
	lineHeightModeSelect.value = isLineHeightCustom ? 'custom' : 'theme';

	const lineHeightInput = lineHeightSetting.controlEl.createEl('input', {
		type: 'number',
		value: isLineHeightCustom ? plugin.settings.lineHeight.toString() : '1.75',
		cls: isLineHeightCustom ? '' : 'source-mode-settings-input-hidden',
		attr: { min: '1.0', max: '2.5', step: '0.05' }
	});
	lineHeightModeSelect.addEventListener('change', () => {
		void (async () => {
			if (lineHeightModeSelect.value === 'custom') {
				lineHeightInput.className = '';
				const num = parseFloat(lineHeightInput.value);
				if (!isNaN(num)) plugin.settings.lineHeight = num;
			} else {
				lineHeightInput.className = 'source-mode-settings-input-hidden';
				plugin.settings.lineHeight = 'theme';
			}
			await plugin.saveSettings();
			plugin.app.workspace.trigger('layout-change');
		})();
	});
	lineHeightInput.addEventListener('input', () => {
		void (async () => {
			if (lineHeightModeSelect.value === 'custom') {
				const num = parseFloat(lineHeightInput.value);
				if (!isNaN(num)) plugin.settings.lineHeight = num;
				await plugin.saveSettings();
				plugin.app.workspace.trigger('layout-change');
			}
		})();
	});
} 