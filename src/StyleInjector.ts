import type { CSSVariables } from './CSSGenerator';

export class StyleInjector {
	private static appliedVariables: Set<string> = new Set();
	private static debugMode = false;

	static setDebugMode(enabled: boolean): void {
		this.debugMode = enabled;
	}

	private static log(message: string, data?: unknown): void {
		if (this.debugMode) {
			console.log(`[SourceMode StyleInjector] ${message}`, data !== undefined ? data : '');
		}
	}

	static setCSSVariables(variables: CSSVariables): void {
		const root = document.documentElement;
		this.log('Setting CSS variables', variables);

		const applied: string[] = [];
		const removed: string[] = [];

		// Apply or update CSS variables
		for (const [name, value] of Object.entries(variables)) {
			if (value !== null) {
				root.style.setProperty(name, value);
				this.appliedVariables.add(name);
				applied.push(`${name}: ${value}`);
			} else {
				// Remove the variable if it's set to null (revert to theme default)
				root.style.removeProperty(name);
				this.appliedVariables.delete(name);
				removed.push(name);
			}
		}

		if (applied.length > 0) {
			this.log('Applied variables', applied);
		}
		if (removed.length > 0) {
			this.log('Removed variables', removed);
		}
	}

	static removeAllVariables(): void {
		const root = document.documentElement;

		this.log('Removing all CSS variables', Array.from(this.appliedVariables));

		// Remove all CSS variables we've applied
		for (const name of this.appliedVariables) {
			root.style.removeProperty(name);
		}

		this.appliedVariables.clear();
	}
}