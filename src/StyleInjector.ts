import type { CSSVariables } from './CSSGenerator';

export class StyleInjector {
	/**
	 * Names of every variable we have ever set. Used to clear them again, since the
	 * value object only tells us what is currently set, not what was set before.
	 */
	private static appliedVariables: Set<string> = new Set();
	private static debugMode = false;

	static setDebugMode(enabled: boolean): void {
		this.debugMode = enabled;
	}

	private static log(message: string, data?: unknown): void {
		if (this.debugMode) {
			console.debug(`[SourceMode StyleInjector] ${message}`, data !== undefined ? data : '');
		}
	}

	/**
	 * Applies the variables to a single editor element.
	 * They go on the element rather than the document root so they resolve inside
	 * popout windows, which are separate documents and cannot see the main window's
	 * root. The stylesheet reads them from .cm-scroller, which inherits from here.
	 */
	static setCSSVariables(el: HTMLElement, variables: CSSVariables): void {
		this.log('Setting CSS variables', variables);

		for (const [name, value] of Object.entries(variables)) {
			if (value !== null) {
				el.style.setProperty(name, value);
				this.appliedVariables.add(name);
			} else {
				// Remove the variable if it's set to null (revert to theme default)
				el.style.removeProperty(name);
			}
		}
	}

	static removeAllVariables(el: HTMLElement): void {
		this.log('Removing all CSS variables', Array.from(this.appliedVariables));

		for (const name of this.appliedVariables) {
			el.style.removeProperty(name);
		}
	}
}
