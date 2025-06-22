import type { SourceModeStylingSettings } from './main';

export class CSSGenerator {
	static generateCSS(settings: SourceModeStylingSettings): string {
		const { fontFamily, fontSize, lineHeight, fontColor, headingColor, backgroundColor, fontWeight } = settings;
		
		const backgroundColorVar = backgroundColor && backgroundColor !== 'theme' 
			? `background-color: ${backgroundColor};` : '';
		const fontColorVar = fontColor && fontColor !== 'theme' 
			? `color: ${fontColor};` : '';
		const headingColorVar = headingColor && headingColor !== 'theme' 
			? `color: ${headingColor};` : '';
		const fontFamilyVar = fontFamily && fontFamily !== 'theme' 
			? `font-family: '${fontFamily}', monospace;` : '';
		const fontSizeVar = typeof fontSize === 'number' 
			? `font-size: ${fontSize}px;` : '';
		const lineHeightVar = typeof lineHeight === 'number' 
			? `line-height: ${lineHeight};` : '';
		const fontWeightVar = this.generateFontWeightCSS(fontWeight);

		return `
			.source-mode-raw .markdown-source-view.mod-cm6 .cm-scroller {
				${fontFamilyVar}
				${fontSizeVar}
				${fontColorVar}
				${backgroundColorVar}
				${fontWeightVar}
				${lineHeightVar}
			}
			.source-mode-raw .markdown-source-view.mod-cm6 .cm-header {
				color:inherit;
			}
			.source-mode-raw .markdown-source-view.mod-cm6 .cm-header {
				${headingColorVar}
			}
		`;
	}

	private static generateFontWeightCSS(fontWeight?: string | number): string {
		if (!fontWeight || fontWeight === 'theme') return '';
		
		if (fontWeight === 'normal') return 'font-weight: 400;';
		if (fontWeight === 'light') return 'font-weight: 200;';
		if (fontWeight === 'semibold') return 'font-weight: 600;';
		if (fontWeight === 'bold') return 'font-weight: 700;';
		
		return `font-weight: ${fontWeight};`;
	}
}