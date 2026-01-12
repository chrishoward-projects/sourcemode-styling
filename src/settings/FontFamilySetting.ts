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
		this.dropdown = document.createElement('select');
		this.dropdown.disabled = true;

		const loadingOption = document.createElement('option');
		loadingOption.value = '';
		loadingOption.textContent = 'Loading fonts...';
		this.dropdown.appendChild(loadingOption);

		setting.controlEl.appendChild(this.dropdown);

		// Create refresh button (hidden until fonts load)
		this.refreshButton = document.createElement('button');
		this.refreshButton.textContent = 'Refresh Fonts';
		this.refreshButton.className = 'mod-cta';
		this.refreshButton.style.display = 'none';
		this.refreshButton.style.marginLeft = '8px';
		this.refreshButton.addEventListener('click', () => {
			void this.handleRefresh();
		});

		setting.controlEl.appendChild(this.refreshButton);

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
				this.refreshButton.style.display = '';
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

		// Clear loading state
		this.dropdown.innerHTML = '';
		this.dropdown.disabled = false;

		// Add 'theme' option
		const themeOption = document.createElement('option');
		themeOption.value = 'theme';
		themeOption.textContent = 'Use theme font';
		this.dropdown.appendChild(themeOption);

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
			const option = document.createElement('option');
			option.value = font;
			option.textContent = font;
			this.dropdown!.appendChild(option);
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
