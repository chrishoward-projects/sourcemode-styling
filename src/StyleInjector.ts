export class StyleInjector {
	private static readonly STYLE_ID = "sourcemode-styling-font-style";

	static injectCSS(css: string): void {
		let styleEl = document.getElementById(this.STYLE_ID) as HTMLStyleElement | null;
		
		if (!styleEl) {
			styleEl = document.createElement("style");
			styleEl.id = this.STYLE_ID;
			document.head.appendChild(styleEl);
		}
		
		styleEl.textContent = css;
	}

	static removeCSS(): void {
		const styleEl = document.getElementById(this.STYLE_ID);
		if (styleEl) {
			styleEl.remove();
		}
	}
}