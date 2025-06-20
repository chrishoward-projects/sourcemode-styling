import type SourceModeStyling from '../main';
import { BaseSetting, SettingConfig } from './BaseSetting';

class HeadingColorSetting extends BaseSetting {
	constructor(containerEl: HTMLElement, plugin: SourceModeStyling) {
		const config: SettingConfig = {
			name: 'Heading color',
			description: 'Set the color for headings in source mode',
			defaultValue: '#2d5b8c',
			options: [
				{ value: 'theme', text: 'Theme default' },
				{ value: 'custom', text: 'Custom' }
			],
			inputType: 'color'
		};
		super(containerEl, plugin, config);
	}

	protected getSettingValue(): string {
		return this.plugin.settings.headingColor || 'theme';
	}

	protected setSettingValue(value: string | number): void {
		this.plugin.settings.headingColor = value === 'theme' ? 'theme' : value as string;
	}
}

export function addHeadingColorSetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	new HeadingColorSetting(containerEl, plugin).render();
} 