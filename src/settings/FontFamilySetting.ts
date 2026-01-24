import { Setting } from 'obsidian';
import type SourceModeStyling from '../main';
import { BaseSetting, SettingConfig } from './BaseSetting';
import { getAvailableFonts, invalidateFontCache } from '../fontCache';

class FontFamilySetting extends BaseSetting {
	private availableFonts: string[] = [];
	private dropdown: HTMLSelectElement | null = null;
	private refreshButton: HTMLButtonElement | null = null;

	constructor(containerEl: HTMLElement, plugin: SourceModeStyling) {
		const config: SettingConfig = {
			name: 'Monospace font',
			description: 'Select a monospace font for source mode',
			defaultValue: 'Source Code Pro',
			options: []
		};
		super(containerEl, plugin, config);
	}

	protected getSettingValue(): string {
		return this.plugin.settings.fontFamily;
	}

	protected setSettingValue(value: string | number): void {
		this.plugin.settings.fontFamily = value as string;
	}

	public render(): void {
		const setting = new Setting(this.containerEl)
			.setName(this.config.name)
			.setDesc(this.config.description);

		// Create dropdown with loading state
		this.dropdown = setting.controlEl.createEl('select');
		this.dropdown.disabled = true;
		this.dropdown.createEl('option', { value: '', text: 'Loading fonts...' });

		// Create refresh button (hidden until fonts load)
		this.refreshButton = setting.controlEl.createEl('button', {
			text: 'Refresh fonts',
			cls: 'mod-cta sourcemode-refresh-button is-hidden'
		});
		this.refreshButton.addEventListener('click', () => {
			void this.handleRefresh();
		});

		// Load fonts asynchronously
		void this.loadFontsAsync();
	}

	private async loadFontsAsync(): Promise<void> {
		try {
			const result = await getAvailableFonts(
				this.plugin.settings,
				() => this.plugin.saveSettings(),
				this.containerEl
			);

			this.availableFonts = result.fonts;
			this.populateDropdown();

			// Show refresh button after successful load
			if (this.refreshButton) {
				this.refreshButton.classList.remove('is-hidden');
			}
		} catch (error) {
			console.error('Failed to load fonts:', error);
			// On error, use full font list as fallback
			const { MONOSPACE_FONTS } = await import('../constants');
			this.availableFonts = MONOSPACE_FONTS;
			this.populateDropdown();
		}
	}

	private populateDropdown(): void {
		if (!this.dropdown) return;

		// Clear loading state using Obsidian's safe empty() method
		this.dropdown.empty();
		this.dropdown.disabled = false;

		// Add 'theme' option
		this.dropdown.createEl('option', { value: 'theme', text: 'Use theme font' });

		// Always include the current font if it's not already there
		const currentFont = this.plugin.settings.fontFamily;
		if (currentFont && currentFont !== 'theme' && !this.availableFonts.includes(currentFont)) {
			this.availableFonts.push(currentFont);
		}

		// Ensure 'monospace' is always available
		if (!this.availableFonts.includes('monospace')) {
			this.availableFonts.push('monospace');
		}

		// Add detected fonts
		this.availableFonts.forEach(font => {
			this.dropdown!.createEl('option', { value: font, text: font });
		});

		// Set current value
		this.dropdown.value = currentFont;

		// Attach change listener
		this.dropdown.addEventListener('change', () => {
			void (async () => {
				const selectedFont = this.dropdown!.value;
				this.setSettingValue(selectedFont);
				await this.plugin.saveSettings();
				this.plugin.app.workspace.trigger('layout-change');
			})();
		});
	}

	private async handleRefresh(): Promise<void> {
		if (!this.dropdown || !this.refreshButton) return;

		// Disable controls and show refreshing state
		this.dropdown.disabled = true;
		this.refreshButton.disabled = true;
		const originalText = this.refreshButton.textContent;
		this.refreshButton.textContent = 'Refreshing...';

		try {
			// Invalidate cache
			invalidateFontCache(this.plugin.settings);

			// Re-detect fonts
			const result = await getAvailableFonts(
				this.plugin.settings,
				() => this.plugin.saveSettings(),
				this.containerEl
			);

			this.availableFonts = result.fonts;
			this.populateDropdown();
		} catch (error) {
			console.error('Failed to refresh fonts:', error);
		} finally {
			// Re-enable controls
			this.dropdown.disabled = false;
			this.refreshButton.disabled = false;
			this.refreshButton.textContent = originalText;
		}
	}
}

export function addFontFamilySetting(containerEl: HTMLElement, plugin: SourceModeStyling) {
	new FontFamilySetting(containerEl, plugin).render();
}
