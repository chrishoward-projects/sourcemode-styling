import type { SourceModeStylingSettings } from './main';

export interface CSSVariables {
	[key: string]: string | null;
}

export class CSSGenerator {
	static generateCSSVariables(settings: SourceModeStylingSettings): CSSVariables {
		const { fontFamily, fontSize, lineHeight, fontColor, headingColor, backgroundColor, fontWeight } = settings;

		return {
			'--sourcemode-font-family': fontFamily && fontFamily !== 'theme'
				? `"${fontFamily}", monospace`
				: null,
			'--sourcemode-font-size': typeof fontSize === 'number'
				? `${fontSize}px`
				: null,
			'--sourcemode-line-height': typeof lineHeight === 'number'
				? `${lineHeight}`
				: null,
			'--sourcemode-font-color': fontColor && fontColor !== 'theme'
				? fontColor
				: null,
			'--sourcemode-heading-color': headingColor && headingColor !== 'theme'
				? headingColor
				: null,
			'--sourcemode-background-color': backgroundColor && backgroundColor !== 'theme'
				? backgroundColor
				: null,
			'--sourcemode-font-weight': this.generateFontWeightValue(fontWeight)
		};
	}

	private static generateFontWeightValue(fontWeight?: string | number): string | null {
		if (!fontWeight || fontWeight === 'theme') return null;

		if (fontWeight === 'normal') return '400';
		if (fontWeight === 'light') return '200';
		if (fontWeight === 'semibold') return '600';
		if (fontWeight === 'bold') return '700';

		return `${fontWeight}`;
	}
}