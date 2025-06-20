import type SourceModeStyling from '../main';
import { BaseSetting, SettingConfig } from './BaseSetting';

class FontWeightSetting extends BaseSetting {
	constructor(containerEl: HTMLElement, plugin: SourceModeStyling) {
		const config: SettingConfig = {
			name: 'Font weight',
			description: 'Set the font weight for source/raw mode',
			defaultValue: 'theme',
			options: [
				{ value: 'theme', text: 'Theme default' },
				{ value: 'normal', text: 'Normal' },
				{ value: 'light', text: 'Light' },
				{ value: 'semibold', text: 'Semi-bold' },
				{ value: 'bold', text: 'Bold' },
				{ value: 'custom', text: 'Custom' }
			],
			inputType: 'number',
			inputAttributes: {
				min: '100',
				max: '900',
				step: '100'
			}
		};
		super(containerEl, plugin, config);
	}

	protected getSettingValue(): string | number {
		const fontWeight = this.plugin.settings.fontWeight;
		if (typeof fontWeight === 'number') return fontWeight;
		return fontWeight || 'theme';
	}

	protected setSettingValue(value: string | number): void {
		if (typeof value === 'number' || value === 'custom') {
			this.plugin.settings.fontWeight = typeof value === 'number' ? value : 400;
		} else {
			this.plugin.settings.fontWeight = value as string;
		}
	}
}

export function addFontWeightSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	new FontWeightSetting(containerEl, plugin).render();
} 