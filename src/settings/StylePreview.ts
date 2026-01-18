import type SourceModeStyling from '../main';
import { EventRef } from 'obsidian';

export class StylePreview {
	private plugin: SourceModeStyling;
	private containerEl: HTMLElement;
	private previewWrapper: HTMLElement | null = null;
	private headingEl: HTMLElement | null = null;
	private paragraphEl: HTMLElement | null = null;
	private eventRef: EventRef | null = null;

	constructor(containerEl: HTMLElement, plugin: SourceModeStyling) {
		this.containerEl = containerEl;
		this.plugin = plugin;
	}

	public render(): void {
		const previewSection = document.createElement('div');
		previewSection.className = 'style-preview-section';

		const headingWrapper = document.createElement('div');
		headingWrapper.className = 'setting-item-heading';

		const nameEl = document.createElement('div');
		nameEl.className = 'setting-item-name';
		nameEl.textContent = 'Style preview';

		const descEl = document.createElement('div');
		descEl.className = 'setting-item-description';
		descEl.textContent = 'Preview how your settings will appear in source mode. This approximate only. Headings, lists, and other elements may vary.';

		headingWrapper.appendChild(nameEl);
		headingWrapper.appendChild(descEl);

		this.previewWrapper = document.createElement('div');
		this.previewWrapper.className = 'style-preview-container';

		this.headingEl = document.createElement('div');
		this.headingEl.className = 'style-preview-heading';
		this.headingEl.textContent = 'The quick brown fox jumps over the lazy dog';

		this.paragraphEl = document.createElement('div');
		this.paragraphEl.className = 'style-preview-paragraph';
		this.paragraphEl.textContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum. AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz 01234567890 !@#$%^&*()_+-={}[]|;\':",.<>?/~`';

		this.previewWrapper.appendChild(this.headingEl);
		this.previewWrapper.appendChild(this.paragraphEl);

		previewSection.appendChild(headingWrapper);
		previewSection.appendChild(this.previewWrapper);

		this.containerEl.appendChild(previewSection);

		this.eventRef = this.plugin.app.workspace.on('layout-change', () => {
			this.updatePreviewStyles();
		});

		this.updatePreviewStyles();
	}

	private updatePreviewStyles(): void {
		if (!this.previewWrapper) return;

		const s = this.plugin.settings;
		const style = this.previewWrapper.style;

		// Set CSS custom properties on the container
		const fontFamily = s.fontFamily === 'theme'
			? 'var(--font-monospace)'
			: `"${s.fontFamily}", monospace`;
		style.setProperty('--preview-font-family', fontFamily);

		const fontSize = s.fontSize === 'theme'
			? 'inherit'
			: `${s.fontSize}px`;
		style.setProperty('--preview-font-size', fontSize);

		const fontWeight = this.getFontWeightValue(s.fontWeight);
		style.setProperty('--preview-font-weight', fontWeight || 'inherit');

		const lineHeight = s.lineHeight === 'theme'
			? 'inherit'
			: `${s.lineHeight}`;
		style.setProperty('--preview-line-height', lineHeight);

		const fontColor = s.fontColor === 'theme'
			? 'var(--text-normal)'
			: s.fontColor;
		style.setProperty('--preview-font-color', fontColor);

		const headingColor = s.headingColor === 'theme'
			? 'var(--text-normal)'
			: s.headingColor;
		style.setProperty('--preview-heading-color', headingColor);

		const backgroundColor = s.backgroundColor === 'theme'
			? 'var(--background-secondary)'
			: s.backgroundColor;
		style.setProperty('--preview-background-color', backgroundColor);
	}

	private getFontWeightValue(fontWeight: string | number): string {
		if (!fontWeight || fontWeight === 'theme') return '';
		if (fontWeight === 'normal') return '400';
		if (fontWeight === 'light') return '200';
		if (fontWeight === 'semibold') return '600';
		if (fontWeight === 'bold') return '700';
		return `${fontWeight}`;
	}

	public destroy(): void {
		if (this.eventRef) {
			this.plugin.app.workspace.offref(this.eventRef);
			this.eventRef = null;
		}
		this.previewWrapper = null;
		this.headingEl = null;
		this.paragraphEl = null;
	}
}

export function addStylePreview(containerEl: HTMLElement, plugin: SourceModeStyling): StylePreview {
	const preview = new StylePreview(containerEl, plugin);
	preview.render();
	return preview;
}
