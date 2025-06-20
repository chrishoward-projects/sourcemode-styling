import type SourceModeStyling from '../main';
import { BaseSetting, SettingConfig } from './BaseSetting';

class BackgroundColorSetting extends BaseSetting {
	constructor(containerEl: HTMLElement, plugin: SourceModeStyling) {
		const config: SettingConfig = {
			name: 'Background color',
			description: 'Set the background color for source mode',
			defaultValue: '#fbfaf6',
			options: [
				{ value: 'theme', text: 'Theme default' },
				{ value: 'custom', text: 'Custom' }
			],
			inputType: 'color'
		};
		super(containerEl, plugin, config);
	}

	protected getSettingValue(): string {
		return this.plugin.settings.backgroundColor || 'theme';
	}

	protected setSettingValue(value: string | number): void {
		this.plugin.settings.backgroundColor = value === 'theme' ? 'theme' : value as string;
	}
}

export function addBackgroundColorSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	new BackgroundColorSetting(containerEl, plugin).render();
} 