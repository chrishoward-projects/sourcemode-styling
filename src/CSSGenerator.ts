import type { SourceModeStylingSettings } from './main';

export class CSSGenerator {
	static generateCSS(settings: SourceModeStylingSettings): string {
		const { fontFamily, fontSize, lineHeight, headingColor, backgroundColor, fontWeight } = settings;
		
		const backgroundColorVar = backgroundColor && backgroundColor !== 'theme' 
			? `background-color: ${backgroundColor};` : '';
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
			.obsidian-mode-raw .markdown-source-view.mod-cm6 .cm-scroller {
				${fontFamilyVar}
				${fontSizeVar}
				${backgroundColorVar}
				${fontWeightVar}
			}
			.obsidian-mode-raw .markdown-source-view.mod-cm6 .cm-scroller{
				${lineHeightVar}
			}
			
			.obsidian-mode-raw .markdown-source-view.mod-cm6 .cm-header {
				${fontFamilyVar}
				${lineHeightVar}
				${headingColorVar}
				${fontWeightVar}
			}
		`;
	}

	private static generateFontWeightCSS(fontWeight?: string | number): string {
		if (!fontWeight || fontWeight === 'theme') return '';
		
		if (fontWeight === 'normal') return 'font-weight: 400;';
		if (fontWeight === 'light') return 'font-weight: 300;';
		if (fontWeight === 'semibold') return 'font-weight: 600;';
		
		return `font-weight: ${fontWeight};`;
	}
}