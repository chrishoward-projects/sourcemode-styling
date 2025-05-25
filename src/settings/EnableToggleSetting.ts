import { Setting } from 'obsidian';
import type SourceModeStyling from '../main';

export function addEnableToggleSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	new Setting(containerEl)
		.setName('Enable source mode styling')
		.addToggle(text => text
			.setValue(plugin.settings.rawModeEnabled)
			.onChange(async (value) => {
				await plugin.toggleStyling(value);
			}));
} 