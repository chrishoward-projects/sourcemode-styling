import { detectAvailableFonts } from '../fontDetect';
import type SourceModeStyling from '../main';
import { BaseSetting, SettingConfig } from './BaseSetting';
import { MONOSPACE_FONTS } from '../constants';

class FontFamilySetting extends BaseSetting {
	constructor(containerEl: HTMLElement, plugin: SourceModeStyling) {
		const availableFonts = detectAvailableFonts(MONOSPACE_FONTS, containerEl);
		const config: SettingConfig = {
			name: 'Monospace font',
			description: 'Select a monospace font for source mode',
			defaultValue: 'Source Code Pro',
			options: [
				{ value: 'theme', text: 'Use theme font' },
				...availableFonts.map(font => ({ value: font, text: font }))
			]
		};
		super(containerEl, plugin, config);
	}

	protected getSettingValue(): string {
		return this.plugin.settings.fontFamily;
	}

	protected setSettingValue(value: string | number): void {
		this.plugin.settings.fontFamily = value as string;
	}
}

export function addFontFamilySetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	new FontFamilySetting(containerEl, plugin).render();
} 