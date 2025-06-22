import type SourceModeStyling from '../main';
import { BaseSetting, SettingConfig } from './BaseSetting';

class FontSizeSetting extends BaseSetting {
	constructor(containerEl: HTMLElement, plugin: SourceModeStyling) {
		const config: SettingConfig = {
			name: 'Font size',
			description: 'Set the font size for source mode (px)',
			defaultValue: '14',
			options: [
				{ value: 'theme', text: 'Theme default' },
				{ value: 'custom', text: 'Custom' }
			],
			inputType: 'number',
			inputAttributes: {
				min: '9',
				max: '20'
			}
		};
		super(containerEl, plugin, config);
	}

	protected getSettingValue(): string | number {
		return typeof this.plugin.settings.fontSize === 'number' 
			? this.plugin.settings.fontSize 
			: 'theme';
	}

	protected setSettingValue(value: string | number): void {
		if (value === 'theme') {
			this.plugin.settings.fontSize = 'theme';
		} else {
			this.plugin.settings.fontSize = typeof value === 'number' ? value : parseInt(value.toString());
		}
	}
}

export function addFontSizeSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	new FontSizeSetting(containerEl, plugin).render();
} 