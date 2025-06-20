import type SourceModeStyling from '../main';
import { BaseSetting, SettingConfig } from './BaseSetting';

class FontColorSetting extends BaseSetting {
	constructor(containerEl: HTMLElement, plugin: SourceModeStyling) {
		const config: SettingConfig = {
			name: 'Font color',
			description: 'Set the text color for source mode',
			defaultValue: '#333333',
			options: [
				{ value: 'theme', text: 'Theme default' },
				{ value: 'custom', text: 'Custom' }
			],
			inputType: 'color'
		};
		super(containerEl, plugin, config);
	}

	protected getSettingValue(): string {
		return this.plugin.settings.fontColor || 'theme';
	}

	protected setSettingValue(value: string | number): void {
		this.plugin.settings.fontColor = value === 'theme' ? 'theme' : value as string;
	}
}

export function addFontColorSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	new FontColorSetting(containerEl, plugin).render();
} 