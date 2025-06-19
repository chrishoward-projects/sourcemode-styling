export class StyleInjector {
	private static readonly STYLE_ID = "sourcemode-styling-font-style";
	private static styleEl: HTMLStyleElement | null = null;

	static injectCSS(css: string): void {
		if (!this.styleEl) {
			this.styleEl = document.createElement("style");
			this.styleEl.id = this.STYLE_ID;
			document.head.appendChild(this.styleEl);
		}
		
		this.styleEl.textContent = css;
	}

	static removeCSS(): void {
		if (this.styleEl) {
			this.styleEl.remove();
			this.styleEl = null;
		}
	}
}