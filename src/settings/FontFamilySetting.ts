import { detectAvailableFonts } from '../fontDetect';
import type SourceModeStyling from '../main';
import { BaseSetting, SettingConfig } from './BaseSetting';

const MONOSPACE_FONTS = [
	"Andale Mono", "Anonymous Pro", "Bitstream Vera Sans Mono", "Code New Roman", "Cascadia Code", "Cascadia Mono", "Cascadia Mono PL", "Courier New", "Courier Prime", "Courier Prime Code", "Courier Prime Mono", "Courier Prime Sans", "Courier Prime Sans Mono", "Courier Prime Serif", "Courier Prime Serif Mono", "Consolas", "DejaVu Sans Mono", "Droid Sans Mono", "Envy Code R", "Fira Mono", "Fira Code", "Hack", "IBM Plex Mono", "Inconsolata", "JetBrains Mono", "Liberation Mono", "Menlo", "Meslo LG S", "Meslo LG M", "Meslo LG L", "Monaco", "Noto Mono", "Operator Mono", "Pragmata Pro", "Red Hat Mono", "Roboto Mono", "Source Code Pro", "Space Mono", "Ubuntu Mono", "Ubuntu Sans Mono", "VT323", "monospace"
];

class FontFamilySetting extends BaseSetting {
	constructor(containerEl: HTMLElement, plugin: SourceModeStyling) {
		const availableFonts = detectAvailableFonts(MONOSPACE_FONTS);
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