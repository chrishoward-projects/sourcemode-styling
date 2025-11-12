import type { CSSVariables } from './CSSGenerator';

export class StyleInjector {
	private static appliedVariables: Set<string> = new Set();

	static setCSSVariables(variables: CSSVariables): void {
		const root = document.documentElement;

		// Apply or update CSS variables
		for (const [name, value] of Object.entries(variables)) {
			if (value !== null) {
				root.style.setProperty(name, value);
				this.appliedVariables.add(name);
			} else {
				// Remove the variable if it's set to null (revert to theme default)
				root.style.removeProperty(name);
				this.appliedVariables.delete(name);
			}
		}
	}

	static removeAllVariables(): void {
		const root = document.documentElement;

		// Remove all CSS variables we've applied
		for (const name of this.appliedVariables) {
			root.style.removeProperty(name);
		}

		this.appliedVariables.clear();
	}
}